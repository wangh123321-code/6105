import { Controller, Get, Param, Query } from '@nestjs/common';
import { VenuesService } from './venues.service';

@Controller('venues')
export class VenuesController {
  constructor(private readonly venuesService: VenuesService) {}

  @Get()
  findAll() {
    return this.venuesService.findAll();
  }

  @Get(':venueId')
  findOne(@Param('venueId') venueId: number) {
    return this.venuesService.findOne(venueId);
  }

  @Get(':venueId/tables')
  findTables(@Param('venueId') venueId: number) {
    return this.venuesService.findTables(venueId);
  }

  @Get(':venueId/tables-with-reviews')
  findTablesWithReviews(@Param('venueId') venueId: number, @Query('limit') limit?: number) {
    return this.venuesService.findTablesWithReviews(venueId, limit);
  }

  @Get(':venueId/tables/:tableId/reviews')
  findTableReviews(
    @Param('venueId') venueId: number,
    @Param('tableId') tableId: number,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    return this.venuesService.findTableReviews(venueId, tableId, page, pageSize);
  }

  @Get(':venueId/slots')
  getTimeSlotGrid(@Param('venueId') venueId: number, @Query('date') date: string) {
    return this.venuesService.getTimeSlotGrid(venueId, date);
  }
}
