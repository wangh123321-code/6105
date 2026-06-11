import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from './entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existingUsername = await this.userRepo.findOne({ where: { username: dto.username } });
    if (existingUsername) {
      throw new ConflictException('用户名已存在');
    }
    const existingPhone = await this.userRepo.findOne({ where: { phone: dto.phone } });
    if (existingPhone) {
      throw new ConflictException('手机号已被注册');
    }
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = this.userRepo.create({
      username: dto.username,
      password: hashedPassword,
      phone: dto.phone,
      nickname: dto.nickname,
      skill_level: dto.skill_level,
      credit_score: 100,
    });
    await this.userRepo.save(user);
    const { password, ...result } = user;
    return result;
  }

  async login(dto: LoginDto) {
    const user = await this.userRepo.findOne({ where: { username: dto.username } });
    if (!user) {
      throw new UnauthorizedException('用户名或密码错误');
    }
    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('用户名或密码错误');
    }
    const payload = { sub: user.id, username: user.username };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        username: user.username,
        nickname: user.nickname,
        skill_level: user.skill_level,
        credit_score: user.credit_score,
      },
    };
  }

  async validateUser(userId: number) {
    return this.userRepo.findOne({ where: { id: userId } });
  }
}
