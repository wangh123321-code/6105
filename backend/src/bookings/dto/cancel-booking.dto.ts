import { IsInt, IsNotEmpty } from 'class-validator';

export class CancelBookingDto {
  @IsInt()
  @IsNotEmpty()
  booking_id: number;
}
