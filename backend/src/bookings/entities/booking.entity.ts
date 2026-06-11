import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Table } from '../../venues/entities/table.entity';

@Entity('bookings')
export class Booking {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  user_id: number;

  @Column({ name: 'table_id' })
  table_id: number;

  @Column({ name: 'venue_id' })
  venue_id: number;

  @Column({ type: 'date' })
  date: string;

  @Column({ name: 'hour_slot' })
  hour_slot: number;

  @Column({ type: 'enum', enum: ['pending_payment', 'paid', 'cancelled', 'expired'], default: 'pending_payment' })
  status: 'pending_payment' | 'paid' | 'cancelled' | 'expired';

  @Column({ type: 'enum', enum: ['solo', 'match'], default: 'solo', name: 'booking_type' })
  booking_type: 'solo' | 'match';

  @Column({ name: 'match_request_id', nullable: true })
  match_request_id: number | null;

  @Column({ type: 'datetime', nullable: true, name: 'paid_at' })
  paid_at: Date | null;

  @Column({ type: 'datetime', nullable: true, name: 'cancelled_at' })
  cancelled_at: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  @ManyToOne(() => Table)
  @JoinColumn({ name: 'table_id' })
  table: Table;
}
