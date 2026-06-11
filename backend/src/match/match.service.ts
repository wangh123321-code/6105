import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In } from 'typeorm';
import { MatchRequest } from './entities/match-request.entity';
import { User } from '../auth/entities/user.entity';
import { Booking } from '../bookings/entities/booking.entity';
import { Table } from '../venues/entities/table.entity';
import { CreateMatchRequestDto } from './dto/create-match-request.dto';

const SKILL_LEVEL_ORDER: Record<string, number> = { beginner: 0, intermediate: 1, advanced: 2 };

@Injectable()
export class MatchService {
  constructor(
    @InjectRepository(MatchRequest)
    private readonly matchRequestRepo: Repository<MatchRequest>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Booking)
    private readonly bookingRepo: Repository<Booking>,
    @InjectRepository(Table)
    private readonly tableRepo: Repository<Table>,
  ) {}

  async create(userId: number, dto: CreateMatchRequestDto) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('用户不存在');
    }
    const matchRequest = this.matchRequestRepo.create({
      user_id: userId,
      skill_level: user.skill_level,
      venue_id: dto.venue_id,
      preferred_date: dto.date,
      hour_slot: dto.hour_slot,
      status: 'open',
    });
    await this.matchRequestRepo.save(matchRequest);
    return matchRequest;
  }

  async findRecommendations(userId: number, matchRequestId: number) {
    const myRequest = await this.matchRequestRepo.findOne({ where: { id: matchRequestId } });
    if (!myRequest) {
      throw new NotFoundException('找球友请求不存在');
    }

    const candidates = await this.matchRequestRepo.find({
      where: {
        status: 'open',
        venue_id: myRequest.venue_id,
        preferred_date: myRequest.preferred_date,
        hour_slot: myRequest.hour_slot,
      },
    });

    const filtered = candidates.filter((c) => c.user_id !== userId);

    const myLevel = SKILL_LEVEL_ORDER[myRequest.skill_level];

    filtered.sort((a, b) => {
      const diffA = Math.abs(SKILL_LEVEL_ORDER[a.skill_level] - myLevel);
      const diffB = Math.abs(SKILL_LEVEL_ORDER[b.skill_level] - myLevel);
      return diffA - diffB;
    });

    const userIds = filtered.map((c) => c.user_id);
    if (userIds.length === 0) return [];

    const users = await this.userRepo.findBy({ id: In(userIds) });
    const userMap = new Map(users.map((u) => [u.id, u]));

    return filtered.map((c) => ({
      match_request_id: c.id,
      user_id: c.user_id,
      nickname: userMap.get(c.user_id)?.nickname || '',
      skill_level: c.skill_level,
    }));
  }

  async confirmMatch(userId: number, matchRequestId: number) {
    const targetRequest = await this.matchRequestRepo.findOne({ where: { id: matchRequestId, status: 'open' } });
    if (!targetRequest) {
      throw new NotFoundException('找球友请求不存在或已匹配');
    }

    if (targetRequest.user_id === userId) {
      throw new BadRequestException('不能匹配自己的请求');
    }

    const tables = await this.tableRepo.find({ where: { venue_id: targetRequest.venue_id } });
    if (tables.length === 0) {
      throw new BadRequestException('该球馆没有可用球台');
    }

    const occupiedBookings = await this.bookingRepo.find({
      where: {
        date: targetRequest.preferred_date,
        hour_slot: targetRequest.hour_slot,
        status: 'paid',
      },
    });
    const occupiedTableIds = new Set(occupiedBookings.map((b) => b.table_id));
    const availableTable = tables.find((t) => !occupiedTableIds.has(t.id));

    if (!availableTable) {
      throw new BadRequestException('该时段没有可用球台');
    }

    const booking1 = this.bookingRepo.create({
      user_id: targetRequest.user_id,
      table_id: availableTable.id,
      venue_id: targetRequest.venue_id,
      date: targetRequest.preferred_date,
      hour_slot: targetRequest.hour_slot,
      status: 'paid',
      booking_type: 'match',
      match_request_id: targetRequest.id,
      paid_at: new Date(),
    });
    const booking2 = this.bookingRepo.create({
      user_id: userId,
      table_id: availableTable.id,
      venue_id: targetRequest.venue_id,
      date: targetRequest.preferred_date,
      hour_slot: targetRequest.hour_slot,
      status: 'paid',
      booking_type: 'match',
      match_request_id: targetRequest.id,
      paid_at: new Date(),
    });
    await this.bookingRepo.save([booking1, booking2]);

    targetRequest.status = 'matched';
    targetRequest.matched_user_id = userId;
    targetRequest.matched_booking_id = booking1.id;
    await this.matchRequestRepo.save(targetRequest);

    return {
      match_request: targetRequest,
      bookings: [booking1, booking2],
    };
  }

  async findMyRequests(userId: number) {
    return this.matchRequestRepo.find({
      where: { user_id: userId },
      order: { created_at: 'DESC' },
    });
  }
}
