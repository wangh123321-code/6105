import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../auth/entities/user.entity';

@Injectable()
export class CreditGuard implements CanActivate {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user) {
      throw new ForbiddenException('用户未登录');
    }
    const dbUser = await this.userRepo.findOne({ where: { id: user.id } });
    if (!dbUser) {
      throw new ForbiddenException('用户不存在');
    }
    if (dbUser.credit_score < 60) {
      throw new ForbiddenException('信用分不足，无法操作');
    }
    if (dbUser.banned_until && new Date(dbUser.banned_until) > new Date()) {
      throw new ForbiddenException(`账号已被封禁至 ${dbUser.banned_until}`);
    }
    return true;
  }
}
