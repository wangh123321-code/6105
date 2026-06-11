import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Venue } from './venue.entity';

@Entity('tables')
export class Table {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'venue_id' })
  venue_id: number;

  @Column()
  name: string;

  @Column({ default: 'available' })
  status: string;

  @ManyToOne(() => Venue, (venue) => venue.tables)
  @JoinColumn({ name: 'venue_id' })
  venue: Venue;

  @CreateDateColumn()
  created_at: Date;
}
