import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeederService } from './seeder.service';
import { User } from '../auth/entities/user.entity';
import { Venue } from '../venues/entities/venue.entity';
import { Table } from '../venues/entities/table.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Venue, Table])],
  providers: [SeederService],
})
export class SeederModule {}
