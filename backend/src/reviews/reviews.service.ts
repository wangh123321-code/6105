import { Injectable, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Review } from './entities/review.entity';
import { Booking } from '../bookings/entities/booking.entity';
import { Table } from '../venues/entities/table.entity';
import { Venue } from '../venues/entities/venue.entity';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepo: Repository<Review>,
    @InjectRepository(Booking)
    private readonly bookingRepo: Repository<Booking>,
    @InjectRepository(Table)
    private readonly tableRepo: Repository<Table>,
    @InjectRepository(Venue)
    private readonly venueRepo: Repository<Venue>,
    private readonly dataSource: DataSource,
  ) {}

  async create(userId: number, dto: CreateReviewDto) {
    if (dto.rating < 1 || dto.rating > 5) {
      throw new BadRequestException('评分必须在1-5星之间');
    }

    const booking = await this.bookingRepo.findOne({
      where: { id: dto.booking_id, user_id: userId },
    });
    if (!booking) {
      throw new NotFoundException('预约不存在');
    }

    if (booking.status !== 'paid') {
      throw new BadRequestException('只有已支付的预约才能评价');
    }

    const slotEnd = new Date(`${booking.date}T${String(booking.hour_slot + 1).padStart(2, '0')}:00:00`);
    const now = new Date();
    if (now < slotEnd) {
      throw new BadRequestException('预约时段未结束，暂不能评价');
    }

    const bookingDate = new Date(booking.date);
    const sevenDaysLater = new Date(bookingDate);
    sevenDaysLater.setDate(bookingDate.getDate() + 7);
    sevenDaysLater.setHours(23, 59, 59, 999);
    if (now > sevenDaysLater) {
      throw new BadRequestException('评价已超过预约日后7天，无法评价');
    }

    const existingReview = await this.reviewRepo.findOne({
      where: { booking_id: dto.booking_id, user_id: userId },
    });
    if (existingReview) {
      throw new ConflictException('该预约已评价过，不能重复评价');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const review = queryRunner.manager.create(Review, {
        booking_id: dto.booking_id,
        user_id: userId,
        table_id: booking.table_id,
        venue_id: booking.venue_id,
        rating: dto.rating,
        content: dto.content || null,
      });
      await queryRunner.manager.save(review);

      const table = await queryRunner.manager.findOne(Table, {
        where: { id: booking.table_id },
      });
      if (table) {
        const newCount = table.review_count + 1;
        const oldTotal = Number(table.avg_rating) * table.review_count;
        const newAvg = (oldTotal + dto.rating) / newCount;
        table.review_count = newCount;
        table.avg_rating = Number(newAvg.toFixed(2));
        await queryRunner.manager.save(table);
      }

      const venue = await queryRunner.manager.findOne(Venue, {
        where: { id: booking.venue_id },
      });
      if (venue) {
        const newCount = venue.review_count + 1;
        const oldTotal = Number(venue.avg_rating) * venue.review_count;
        const newAvg = (oldTotal + dto.rating) / newCount;
        venue.review_count = newCount;
        venue.avg_rating = Number(newAvg.toFixed(2));
        await queryRunner.manager.save(venue);
      }

      await queryRunner.commitTransaction();
      return review;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async findByTable(tableId: number, page = 1, pageSize = 10) {
    const skip = (page - 1) * pageSize;
    const [reviews, total] = await this.reviewRepo
      .createQueryBuilder('r')
      .leftJoinAndSelect('r.user', 'user')
      .where('r.table_id = :tableId', { tableId })
      .orderBy('r.created_at', 'DESC')
      .skip(skip)
      .take(pageSize)
      .getManyAndCount();

    return {
      list: reviews.map((r) => ({
        id: r.id,
        rating: r.rating,
        content: r.content,
        created_at: r.created_at,
        user: {
          id: r.user.id,
          nickname: (r.user as any).nickname || '',
        },
      })),
      total,
      page,
      pageSize,
    };
  }

  async findLatestByTable(tableId: number, limit = 3) {
    const reviews = await this.reviewRepo
      .createQueryBuilder('r')
      .leftJoinAndSelect('r.user', 'user')
      .where('r.table_id = :tableId', { tableId })
      .orderBy('r.created_at', 'DESC')
      .take(limit)
      .getMany();

    return reviews.map((r) => ({
      id: r.id,
      rating: r.rating,
      content: r.content,
      created_at: r.created_at,
      user: {
        id: r.user.id,
        nickname: (r.user as any).nickname || '',
      },
    }));
  }

  async findByBooking(bookingId: number, userId: number) {
    return this.reviewRepo.findOne({
      where: { booking_id: bookingId, user_id: userId },
    });
  }
}
