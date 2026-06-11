import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
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
    private readonly dataSource: DataSource,
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

  private formatDate(date: any): string {
    if (date instanceof Date) {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    }
    return String(date);
  }

  async findRecommendations(userId: number, matchRequestId: number) {
    const myRequest = await this.matchRequestRepo.findOne({ where: { id: matchRequestId } });
    if (!myRequest) {
      throw new NotFoundException('找球友请求不存在');
    }

    const dateStr = this.formatDate(myRequest.preferred_date);

    const candidates = await this.matchRequestRepo
      .createQueryBuilder('mr')
      .where('mr.status = :status', { status: 'open' })
      .andWhere('mr.venue_id = :venueId', { venueId: myRequest.venue_id })
      .andWhere('DATE(mr.preferred_date) = :date', { date: dateStr })
      .andWhere('mr.hour_slot = :hourSlot', { hourSlot: myRequest.hour_slot })
      .andWhere('mr.user_id != :userId', { userId })
      .getMany();

    const myLevel = SKILL_LEVEL_ORDER[myRequest.skill_level];

    candidates.sort((a, b) => {
      const diffA = Math.abs(SKILL_LEVEL_ORDER[a.skill_level] - myLevel);
      const diffB = Math.abs(SKILL_LEVEL_ORDER[b.skill_level] - myLevel);
      return diffA - diffB;
    });

    const userIds = candidates.map((c) => c.user_id);
    if (userIds.length === 0) return [];

    const users = await this.userRepo.findBy({ id: In(userIds) });
    const userMap = new Map(users.map((u) => [u.id, u]));

    return candidates.map((c) => ({
      match_request_id: c.id,
      user_id: c.user_id,
      nickname: userMap.get(c.user_id)?.nickname || '',
      skill_level: c.skill_level,
    }));
  }

  async confirmMatch(userId: number, matchRequestId: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const targetRequest = await queryRunner.manager.findOne(MatchRequest, {
        where: { id: matchRequestId, status: 'open' },
      });
      if (!targetRequest) {
        throw new NotFoundException('找球友请求不存在或已匹配');
      }

      if (targetRequest.user_id === userId) {
        throw new BadRequestException('不能匹配自己的请求');
      }

      const dateStr = this.formatDate(targetRequest.preferred_date);

      const tables = await queryRunner.manager.find(Table, {
        where: { venue_id: targetRequest.venue_id },
      });
      if (tables.length === 0) {
        throw new BadRequestException('该球馆没有可用球台');
      }

      const tableIds = tables.map((t) => t.id);

      const allOccupied = await queryRunner.manager
        .createQueryBuilder(Booking, 'b')
        .where('b.table_id IN (:...tableIds)', { tableIds })
        .andWhere('DATE(b.date) = :date', { date: dateStr })
        .andWhere('b.hour_slot = :hourSlot', { hourSlot: targetRequest.hour_slot })
        .andWhere('b.status IN (:...statuses)', { statuses: ['paid', 'pending_payment'] })
        .getMany();

      const occupiedTableIds = new Set(allOccupied.map((b) => b.table_id));
      const availableTable = tables.find((t) => !occupiedTableIds.has(t.id));

      if (!availableTable) {
        throw new ConflictException('该时段没有可用球台');
      }

      const booking1 = queryRunner.manager.create(Booking, {
        user_id: targetRequest.user_id,
        table_id: availableTable.id,
        venue_id: targetRequest.venue_id,
        date: dateStr,
        hour_slot: targetRequest.hour_slot,
        status: 'paid',
        booking_type: 'match',
        match_request_id: targetRequest.id,
        paid_at: new Date(),
      });
      const booking2 = queryRunner.manager.create(Booking, {
        user_id: userId,
        table_id: availableTable.id,
        venue_id: targetRequest.venue_id,
        date: dateStr,
        hour_slot: targetRequest.hour_slot,
        status: 'paid',
        booking_type: 'match',
        match_request_id: targetRequest.id,
        paid_at: new Date(),
      });
      const savedBookings = await queryRunner.manager.save([booking1, booking2]);

      targetRequest.status = 'matched';
      targetRequest.matched_user_id = userId;
      targetRequest.matched_booking_id = savedBookings[0].id;
      await queryRunner.manager.save(targetRequest);

      const myRequest = await queryRunner.manager
        .createQueryBuilder(MatchRequest, 'mr')
        .where('mr.user_id = :userId', { userId })
        .andWhere('mr.status = :status', { status: 'open' })
        .andWhere('mr.venue_id = :venueId', { venueId: targetRequest.venue_id })
        .andWhere('DATE(mr.preferred_date) = :date', { date: dateStr })
        .andWhere('mr.hour_slot = :hourSlot', { hourSlot: targetRequest.hour_slot })
        .getOne();

      if (myRequest) {
        myRequest.status = 'matched';
        myRequest.matched_user_id = targetRequest.user_id;
        myRequest.matched_booking_id = savedBookings[1].id;
        await queryRunner.manager.save(myRequest);
      }

      await queryRunner.commitTransaction();

      return {
        match_request: targetRequest,
        bookings: savedBookings,
      };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async findMyRequests(userId: number) {
    return this.matchRequestRepo.find({
      where: { user_id: userId },
      order: { created_at: 'DESC' },
    });
  }
}
