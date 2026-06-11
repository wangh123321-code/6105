import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  username: process.env.DB_USER || 'app',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'penguin_booking',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: false,
  charset: 'utf8mb4',
  timezone: '+08:00',
};
