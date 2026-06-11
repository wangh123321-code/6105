import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn } from 'typeorm';
import { Table } from './table.entity';

@Entity('venues')
export class Venue {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  address: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ type: 'time' })
  open_time: string;

  @Column({ type: 'time' })
  close_time: string;

  @Column({ nullable: true })
  description: string;

  @CreateDateColumn()
  created_at: Date;

  @OneToMany(() => Table, (table) => table.venue)
  tables: Table[];
}
