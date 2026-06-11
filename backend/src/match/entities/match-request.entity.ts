import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('match_requests')
export class MatchRequest {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', name: 'user_id' })
  user_id: number;

  @Column({ type: 'int', name: 'venue_id' })
  venue_id: number;

  @Column({ type: 'enum', enum: ['beginner', 'intermediate', 'advanced'] })
  skill_level: 'beginner' | 'intermediate' | 'advanced';

  @Column({ type: 'date', name: 'preferred_date' })
  preferred_date: string;

  @Column({ type: 'tinyint', name: 'hour_slot' })
  hour_slot: number;

  @Column({ type: 'enum', enum: ['open', 'matched', 'expired', 'cancelled'], default: 'open' })
  status: 'open' | 'matched' | 'expired' | 'cancelled';

  @Column({ type: 'int', name: 'matched_user_id', nullable: true })
  matched_user_id: number | null;

  @Column({ type: 'int', name: 'matched_booking_id', nullable: true })
  matched_booking_id: number | null;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}
