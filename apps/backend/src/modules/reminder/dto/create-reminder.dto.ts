import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsInt,
  Min,
  IsOptional,
  IsBoolean,
  IsEmail,
} from 'class-validator';
import { Trim } from 'src/common/decorators/trim.decorator';

export class CreateReminderConfigDto {
  @ApiProperty({
    description: 'Name of the reminder config',
    example: '30-day',
  })
  @IsOptional()
  @IsString()
  @Trim()
  name?: string;

  @ApiProperty({
    description: 'Days before expiry to send reminder',
    example: 30,
  })
  @IsInt()
  @Min(0)
  offsetDays: number;

  @ApiProperty({
    description: 'Whether this reminder config is active',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;
}

export class CreateReminderRecipientDto {
  @ApiProperty({
    description: 'Email of the recipient',
    example: 'user@example.com',
  })
  @IsEmail()
  @Trim()
  email: string;

  @ApiProperty({
    description: 'Name of recipient',
    example: 'John Doe',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Trim()
  name?: string;

  @ApiProperty({
    description: 'Whether this recipient is active',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
