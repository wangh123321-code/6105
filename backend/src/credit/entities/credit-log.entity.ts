import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('credit_logs')
export class CreditLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', name: 'user_id' })
  user_id: number;

  @Column({ type: 'tinyint', name: 'change_amount' })
  change_amount: number;

  @Column()
  reason: string;

  @Column({ type: 'tinyint', name: 'balance_after' })
  balance_after: number;

  @Column({ type: 'int', name: 'booking_id', nullable: true })
  booking_id: number | null;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;
}
