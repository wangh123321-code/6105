import { IsNumber, IsString, IsOptional } from 'class-validator';

export class CreateBookingDto {
  @IsNumber()
  table_id: number;

  @IsNumber()
  venue_id: number;

  @IsString()
  date: string;

  @IsNumber()
  hour_slot: number;
}
