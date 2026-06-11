import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';
import { Booking } from './entities/booking.entity';
import { User } from '../auth/entities/user.entity';
import { CreditModule } from '../credit/credit.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Booking, User]),
    CreditModule,
  ],
  controllers: [BookingsController],
  providers: [BookingsService],
  exports: [BookingsService],
})
export class BookingsModule {}
