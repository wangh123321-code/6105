import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { databaseConfig } from './config/database.config';
import { AuthModule } from './auth/auth.module';
import { VenuesModule } from './venues/venues.module';
import { BookingsModule } from './bookings/bookings.module';
import { MatchModule } from './match/match.module';
import { CreditModule } from './credit/credit.module';
import { SchedulingModule } from './scheduling/scheduling.module';
import { SeederModule } from './seeder/seeder.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(databaseConfig),
    ScheduleModule.forRoot(),
    AuthModule,
    VenuesModule,
    BookingsModule,
    MatchModule,
    CreditModule,
    SchedulingModule,
    SeederModule,
  ],
})
export class AppModule {}
