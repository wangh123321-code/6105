import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../auth/entities/user.entity';
import { CreditLog } from './entities/credit-log.entity';

@Injectable()
export class CreditService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(CreditLog)
    private readonly creditLogRepo: Repository<CreditLog>,
  ) {}

  async deductCredit(userId: number, amount: number, reason: string, bookingId?: number) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      return;
    }

    user.credit_score = Math.max(0, user.credit_score - amount);

    if (user.credit_score < 60) {
      const bannedUntil = new Date();
      bannedUntil.setDate(bannedUntil.getDate() + 7);
      user.banned_until = bannedUntil;
    }

    await this.userRepo.save(user);

    const log = this.creditLogRepo.create({
      user_id: userId,
      change_amount: -amount,
      reason,
      balance_after: user.credit_score,
      booking_id: bookingId || null,
    });
    await this.creditLogRepo.save(log);

    return user;
  }

  async getCreditLogs(userId: number) {
    return this.creditLogRepo.find({
      where: { user_id: userId },
      order: { created_at: 'DESC' },
    });
  }
}
