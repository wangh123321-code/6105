import { Injectable, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Booking } from './entities/booking.entity';
import { User } from '../auth/entities/user.entity';
import { CreateBookingDto } from './dto/create-booking.dto';
import { CreditService } from '../credit/credit.service';

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepo: Repository<Booking>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly creditService: CreditService,
    private readonly dataSource: DataSource,
  ) {}

  async create(userId: number, dto: CreateBookingDto) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('用户不存在');
    }
    if (user.credit_score < 60) {
      throw new BadRequestException('信用分不足，无法预约');
    }
    if (user.banned_until && new Date(user.banned_until) > new Date()) {
      throw new BadRequestException('账号已被封禁，无法预约');
    }

    const existingBooking = await this.bookingRepo.findOne({
      where: {
        user_id: userId,
        date: dto.date,
        hour_slot: dto.hour_slot,
        status: 'paid',
      },
    });
    if (existingBooking) {
      throw new ConflictException('同一日期同一时段已有其他预约');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const existingSlot = await queryRunner.manager.findOne(Booking, {
        where: {
          table_id: dto.table_id,
          date: dto.date,
          hour_slot: dto.hour_slot,
          status: 'paid',
        },
      });
      if (existingSlot) {
        throw new ConflictException('该球台时段已被占用');
      }

      const pendingSlot = await queryRunner.manager.findOne(Booking, {
        where: {
          table_id: dto.table_id,
          date: dto.date,
          hour_slot: dto.hour_slot,
          status: 'pending_payment',
        },
      });
      if (pendingSlot) {
        throw new ConflictException('该球台时段正在被其他用户预约中');
      }

      const booking = queryRunner.manager.create(Booking, {
        user_id: userId,
        table_id: dto.table_id,
        venue_id: dto.venue_id,
        date: dto.date,
        hour_slot: dto.hour_slot,
        status: 'pending_payment',
        booking_type: 'solo',
      });
      await queryRunner.manager.save(booking);
      await queryRunner.commitTransaction();
      return booking;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async pay(bookingId: number, userId: number) {
    const booking = await this.bookingRepo.findOne({ where: { id: bookingId, user_id: userId } });
    if (!booking) {
      throw new NotFoundException('预约不存在');
    }
    if (booking.status !== 'pending_payment') {
      throw new BadRequestException('预约状态不允许支付');
    }

    const conflict = await this.bookingRepo.findOne({
      where: {
        table_id: booking.table_id,
        date: booking.date,
        hour_slot: booking.hour_slot,
        status: 'paid',
      },
    });
    if (conflict) {
      booking.status = 'expired';
      await this.bookingRepo.save(booking);
      throw new ConflictException('该球台时段已被他人支付，预约已失效');
    }

    booking.status = 'paid';
    booking.paid_at = new Date();
    await this.bookingRepo.save(booking);
    return booking;
  }

  async cancel(bookingId: number, userId: number) {
    const booking = await this.bookingRepo.findOne({ where: { id: bookingId, user_id: userId } });
    if (!booking) {
      throw new NotFoundException('预约不存在');
    }
    if (booking.status !== 'paid' && booking.status !== 'pending_payment') {
      throw new BadRequestException('预约状态不允许取消');
    }

    const slotStart = new Date(`${booking.date}T${String(booking.hour_slot).padStart(2, '0')}:00:00`);
    const now = new Date();
    const diffHours = (slotStart.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (diffHours < 2 && booking.status === 'paid') {
      await this.creditService.deductCredit(userId, 5, '取消预约不足2小时，扣除信用分', bookingId);
    }

    booking.status = 'cancelled';
    booking.cancelled_at = new Date();
    await this.bookingRepo.save(booking);
    return booking;
  }

  async findMyBookings(userId: number) {
    return this.bookingRepo.find({
      where: { user_id: userId },
      order: { created_at: 'DESC' },
    });
  }

  async findExpiredPendingBookings() {
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
    return this.bookingRepo
      .createQueryBuilder('b')
      .where('b.status = :status', { status: 'pending_payment' })
      .andWhere('b.created_at <= :deadline', { deadline: fifteenMinutesAgo })
      .getMany();
  }

  async expireBooking(bookingId: number) {
    await this.bookingRepo.update(bookingId, { status: 'expired' });
  }
}
