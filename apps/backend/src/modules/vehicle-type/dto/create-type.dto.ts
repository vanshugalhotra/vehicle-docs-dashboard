import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  MinLength,
  MaxLength,
  Matches,
  IsUUID,
} from 'class-validator';

export class CreateVehicleTypeDto {
  @ApiProperty({ description: 'Name of the vehicle type', example: 'SUV' })
  @IsString()
  @MinLength(2, { message: 'Vehicle type name must be at least 2 characters.' })
  @MaxLength(50, {
    message: 'Vehicle type name must be at most 50 characters.',
  })
  @Matches(/^[A-Za-z0-9\s-]+$/, {
    message:
      'Vehicle type name can only contain letters, numbers, spaces, and hyphens.',
  })
  name: string;

  @ApiProperty({
    description: 'ID of the parent category',
    example: 'cat-uuid',
  })
  @IsUUID('4', { message: 'categoryId must be a valid UUID.' })
  categoryId: string;
}
