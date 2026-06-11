import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { BookingsService } from '../bookings/bookings.service';

@Injectable()
export class SchedulingService {
  private readonly logger = new Logger(SchedulingService.name);

  constructor(private readonly bookingsService: BookingsService) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async handleExpiredPendingPayments() {
    const expiredBookings = await this.bookingsService.findExpiredPendingBookings();
    for (const booking of expiredBookings) {
      await this.bookingsService.expireBooking(booking.id);
      this.logger.log(`预约 #${booking.id} 已超时过期，自动设为 expired`);
    }
  }
}
