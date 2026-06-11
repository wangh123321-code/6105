import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from '../auth/entities/user.entity';
import { Venue } from '../venues/entities/venue.entity';
import { Table } from '../venues/entities/table.entity';

interface TestUser {
  username: string;
  password: string;
  phone: string;
  nickname: string;
  skill_level: 'beginner' | 'intermediate' | 'advanced';
}

const TEST_USERS: TestUser[] = [
  { username: 'zhangsan', password: '123456', phone: '13800000001', nickname: '张三', skill_level: 'beginner' },
  { username: 'lisi', password: '123456', phone: '13800000002', nickname: '李四', skill_level: 'intermediate' },
  { username: 'wangwu', password: '123456', phone: '13800000003', nickname: '王五', skill_level: 'advanced' },
  { username: 'zhaoliu', password: '123456', phone: '13800000004', nickname: '赵六', skill_level: 'intermediate' },
  { username: 'sunqi', password: '123456', phone: '13800000005', nickname: '孙七', skill_level: 'beginner' },
];

const VENUE_DATA = [
  { name: '朝阳社区乒乓球馆', address: '朝阳区建国路88号', phone: '010-65001001' },
  { name: '海淀社区乒乓球馆', address: '海淀区中关村大街66号', phone: '010-65001002' },
  { name: '西城社区乒乓球馆', address: '西城区金融街22号', phone: '010-65001003' },
  { name: '东城社区乒乓球馆', address: '东城区东直门内大街10号', phone: '010-65001004' },
  { name: '丰台社区乒乓球馆', address: '丰台区南三环西路16号', phone: '010-65001005' },
  { name: '石景山社区乒乓球馆', address: '石景山区石景山路23号', phone: '010-65001006' },
  { name: '通州社区乒乓球馆', address: '通州区新华西街5号', phone: '010-65001007' },
  { name: '大兴社区乒乓球馆', address: '大兴区黄村东大街12号', phone: '010-65001008' },
];

@Injectable()
export class SeederService implements OnModuleInit {
  private readonly logger = new Logger(SeederService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Venue)
    private readonly venueRepo: Repository<Venue>,
    @InjectRepository(Table)
    private readonly tableRepo: Repository<Table>,
  ) {}

  async onModuleInit() {
    await this.seedVenues();
    await this.seedUsers();
  }

  private async seedUsers() {
    try {
      const count = await this.userRepo.count();
      if (count > 0) {
        this.logger.log(`用户表已有 ${count} 条记录，跳过用户数据初始化`);
        return;
      }

      this.logger.log('开始初始化测试用户数据...');
      for (const u of TEST_USERS) {
        const hashedPassword = await bcrypt.hash(u.password, 10);
        const user = this.userRepo.create({
          username: u.username,
          password: hashedPassword,
          phone: u.phone,
          nickname: u.nickname,
          skill_level: u.skill_level,
          credit_score: 100,
        });
        await this.userRepo.save(user);
        this.logger.log(`  创建用户: ${u.username} (${u.nickname}) - 密码: ${u.password}`);
      }
      this.logger.log('测试用户数据初始化完成');
    } catch (err) {
      this.logger.error('用户数据初始化失败:', err);
    }
  }

  private async seedVenues() {
    try {
      const count = await this.venueRepo.count();
      if (count > 0) {
        this.logger.log(`球馆表已有 ${count} 条记录，跳过球馆数据初始化`);
        return;
      }

      this.logger.log('开始初始化球馆和球台数据...');
      for (let i = 0; i < VENUE_DATA.length; i++) {
        const v = VENUE_DATA[i];
        const venue = this.venueRepo.create(v);
        const savedVenue = await this.venueRepo.save(venue);

        const tables: Table[] = [];
        for (let t = 1; t <= 8; t++) {
          tables.push(
            this.tableRepo.create({
              venue_id: savedVenue.id,
              name: `${t}号台`,
            }),
          );
        }
        await this.tableRepo.save(tables);
        this.logger.log(`  创建球馆: ${v.name} (含 8 张球台)`);
      }
      this.logger.log('球馆和球台数据初始化完成');
    } catch (err) {
      this.logger.error('球馆数据初始化失败:', err);
    }
  }
}
