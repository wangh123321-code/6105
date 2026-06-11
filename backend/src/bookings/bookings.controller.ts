import { Controller, Post, Get, Body, UseGuards, Param } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CreditGuard } from '../common/guards/credit.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CreateBookingDto } from './dto/create-booking.dto';

@Controller('bookings')
@UseGuards(JwtAuthGuard)
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  @UseGuards(CreditGuard)
  create(@CurrentUser('id') userId: number, @Body() dto: CreateBookingDto) {
    return this.bookingsService.create(userId, dto);
  }

  @Post(':id/pay')
  pay(@Param('id') id: number, @CurrentUser('id') userId: number) {
    return this.bookingsService.pay(id, userId);
  }

  @Post(':id/cancel')
  cancel(@Param('id') id: number, @CurrentUser('id') userId: number) {
    return this.bookingsService.cancel(id, userId);
  }

  @Get('mine')
  findMyBookings(@CurrentUser('id') userId: number) {
    return this.bookingsService.findMyBookings(userId);
  }
}
