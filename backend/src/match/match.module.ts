import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MatchController } from './match.controller';
import { MatchService } from './match.service';
import { MatchRequest } from './entities/match-request.entity';
import { User } from '../auth/entities/user.entity';
import { Booking } from '../bookings/entities/booking.entity';
import { Table } from '../venues/entities/table.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MatchRequest, User, Booking, Table])],
  controllers: [MatchController],
  providers: [MatchService],
  exports: [MatchService],
})
export class MatchModule {}
