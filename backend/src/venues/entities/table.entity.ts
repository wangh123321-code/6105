import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Venue } from './venue.entity';

@Entity('tables')
export class Table {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', name: 'venue_id' })
  venue_id: number;

  @Column()
  name: string;

  @Column({ type: 'decimal', precision: 3, scale: 2, name: 'avg_rating', default: 0 })
  avg_rating: number;

  @Column({ type: 'int', name: 'review_count', default: 0 })
  review_count: number;

  @ManyToOne(() => Venue, (venue) => venue.tables)
  @JoinColumn({ name: 'venue_id' })
  venue: Venue;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
