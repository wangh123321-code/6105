import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Venue } from './entities/venue.entity';
import { Table } from './entities/table.entity';
import { Booking } from '../bookings/entities/booking.entity';

@Injectable()
export class VenuesService {
  constructor(
    @InjectRepository(Venue)
    private readonly venueRepo: Repository<Venue>,
    @InjectRepository(Table)
    private readonly tableRepo: Repository<Table>,
    @InjectRepository(Booking)
    private readonly bookingRepo: Repository<Booking>,
  ) {}

  async findAll() {
    return this.venueRepo.find();
  }

  async findOne(venueId: number) {
    const venue = await this.venueRepo.findOne({ where: { id: venueId } });
    if (!venue) {
      throw new NotFoundException('球馆不存在');
    }
    return venue;
  }

  async findTables(venueId: number) {
    const venue = await this.venueRepo.findOne({ where: { id: venueId } });
    if (!venue) {
      throw new NotFoundException('球馆不存在');
    }
    return this.tableRepo.find({ where: { venue_id: venueId } });
  }

  async getTimeSlotGrid(venueId: number, date: string) {
    const venue = await this.venueRepo.findOne({ where: { id: venueId } });
    if (!venue) {
      throw new NotFoundException('球馆不存在');
    }

    const tables = await this.tableRepo.find({ where: { venue_id: venueId } });
    if (tables.length === 0) {
      return [];
    }

    const openHour = parseInt(venue.open_time.split(':')[0], 10);
    const closeHour = parseInt(venue.close_time.split(':')[0], 10);
    const hours: number[] = [];
    for (let h = openHour; h < closeHour; h++) {
      hours.push(h);
    }

    const tableIds = tables.map((t) => t.id);
    const bookings = await this.bookingRepo
      .createQueryBuilder('b')
      .where('b.table_id IN (:...tableIds)', { tableIds })
      .andWhere('DATE(b.date) = :date', { date })
      .andWhere('b.status IN (:...statuses)', { statuses: ['pending_payment', 'paid'] })
      .getMany();

    const bookingMap = new Map<string, Booking>();
    for (const b of bookings) {
      const key = `${b.table_id}_${b.hour_slot}`;
      bookingMap.set(key, b);
    }

    return tables.map((table) => ({
      table_id: table.id,
      table_name: table.name,
      slots: hours.map((hour) => ({
        hour: hour,
        status: bookingMap.has(`${table.id}_${hour}`) ? 'occupied' : 'available',
      })),
    }));
  }
}
