import { Module } from '@nestjs/common';
import { SchedulingService } from './scheduling.service';
import { BookingsModule } from '../bookings/bookings.module';

@Module({
  imports: [BookingsModule],
  providers: [SchedulingService],
})
export class SchedulingModule {}
