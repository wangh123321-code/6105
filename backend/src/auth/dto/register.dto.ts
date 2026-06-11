import { IsString, IsEnum, MinLength, IsNotEmpty } from 'class-validator';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsNotEmpty()
  nickname: string;

  @IsEnum(['beginner', 'intermediate', 'advanced'])
  skill_level: 'beginner' | 'intermediate' | 'advanced';
}
