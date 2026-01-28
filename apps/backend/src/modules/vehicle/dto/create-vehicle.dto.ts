import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, IsOptional, MaxLength } from 'class-validator';
import { Trim } from 'src/common/decorators/trim.decorator';

export class CreateVehicleDto {
  @ApiProperty({
    description: 'Category ID of the vehicle',
    example: 'b1f3a2c4-1234-5678-9abc-1234567890ab',
  })
  @IsUUID()
  categoryId: string;

  @ApiProperty({
    description: 'Type ID of the vehicle',
    example: 'c2d4e5f6-2345-6789-abcd-234567890abc',
  })
  @IsUUID()
  typeId: string;

  @ApiProperty({
    description: 'License plate number',
    example: 'MH12AB1234',
  })
  @IsString()
  @MaxLength(20)
  @Trim()
  licensePlate: string;

  @ApiProperty({
    description: 'RC (Registration Certificate) number',
    example: 'RC123456789',
  })
  @IsString()
  @MaxLength(50)
  @Trim()
  rcNumber: string;

  @ApiProperty({
    description: 'Chassis number of the vehicle',
    example: 'CHS1234567890',
  })
  @IsString()
  @MaxLength(50)
  @Trim()
  chassisNumber: string;

  @ApiProperty({
    description: 'Engine number of the vehicle',
    example: 'ENG1234567890',
  })
  @IsString()
  @MaxLength(50)
  @Trim()
  engineNumber: string;

  @ApiProperty({
    description: 'Optional owner ID',
    example: 'd3e5f6g7-3456-789a-bcde-34567890abcd',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  ownerId?: string;

  @ApiProperty({
    description: 'Optional driver ID',
    example: 'e4f6g7h8-4567-89ab-cdef-4567890abcde',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  driverId?: string;

  @ApiProperty({
    description: 'Optional location ID',
    example: 'f5g7h8i9-5678-9abc-def0-567890abcdef',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  locationId?: string;

  @ApiProperty({
    description: 'Optional notes about the vehicle',
    example: 'Vehicle is for internal use only',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  @Trim()
  notes?: string;

  @ApiProperty({
    description: 'Optional model of the vehicle',
    example: '2021',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Trim()
  model?: string;
}
