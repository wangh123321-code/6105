import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @Column()
  phone: string;

  @Column({ default: '' })
  nickname: string;

  @Column({ type: 'enum', enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' })
  skill_level: 'beginner' | 'intermediate' | 'advanced';

  @Column({ type: 'tinyint', default: 100 })
  credit_score: number;

  @Column({ type: 'datetime', nullable: true })
  banned_until: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}
