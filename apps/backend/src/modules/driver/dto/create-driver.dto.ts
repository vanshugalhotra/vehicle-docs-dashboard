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
import { NoEmoji } from 'src/common/decorators/noemoji.decorator';
import { Trim } from 'src/common/decorators/trim.decorator';

export class CreateDriverDto {
  @ApiProperty({
    description: 'Full name of the driver',
    example: 'Ravi Sharma',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2, { message: 'Driver name must be at least 2 characters long.' })
  @MaxLength(50, { message: 'Driver name must be at most 50 characters.' })
  @NoEmoji()
  @Trim()
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
  @Trim()
  phone: string;

  @ApiPropertyOptional({
    description: 'Optional email address of the driver',
    example: 'ravi.sharma@example.com',
  })
  @IsOptional()
  @IsEmail({}, { message: 'Invalid email format.' })
  @IsString()
  @Trim()
  email?: string;
}
