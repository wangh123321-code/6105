import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CreditService } from './credit.service';
import { CreditLog } from './entities/credit-log.entity';
import { User } from '../auth/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, CreditLog])],
  providers: [CreditService],
  exports: [CreditService],
})
export class CreditModule {}
