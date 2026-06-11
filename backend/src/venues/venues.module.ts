import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VenuesController } from './venues.controller';
import { VenuesService } from './venues.service';
import { Venue } from './entities/venue.entity';
import { Table } from './entities/table.entity';
import { Booking } from '../bookings/entities/booking.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Venue, Table, Booking])],
  controllers: [VenuesController],
  providers: [VenuesService],
  exports: [VenuesService],
})
export class VenuesModule {}
