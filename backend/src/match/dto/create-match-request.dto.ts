import { IsNumber, IsString } from 'class-validator';

export class CreateMatchRequestDto {
  @IsNumber()
  venue_id: number;

  @IsString()
  date: string;

  @IsNumber()
  hour_slot: number;
}
