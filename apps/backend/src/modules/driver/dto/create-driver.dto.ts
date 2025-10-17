import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsEmail,
  Matches,
  MinLength,
  MaxLength,
  IsOptional,
} from 'class-validator';

export class CreateDriverDto {
  @ApiProperty({
    description: 'Full name of the driver',
    example: 'Ravi Sharma',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2, { message: 'Driver name must be at least 2 characters long.' })
  @MaxLength(50, { message: 'Driver name must be at most 50 characters.' })
  @Matches(/^[A-Za-z\s'-]+$/, {
    message:
      'Driver name can only contain letters, spaces, apostrophes, and hyphens.',
  })
  name: string;

  @ApiProperty({
    description: 'Unique phone number of the driver',
    example: '8427733664',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[0-9]{10,15}$/, {
    message:
      'Phone number must contain only digits and be 10 to 15 characters long.',
  })
  phone: string;

  @ApiPropertyOptional({
    description: 'Optional email address of the driver',
    example: 'ravi.sharma@example.com',
  })
  @IsOptional()
  @IsEmail({}, { message: 'Invalid email format.' })
  @IsString()
  email?: string;
}
