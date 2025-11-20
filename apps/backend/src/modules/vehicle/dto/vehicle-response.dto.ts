import { ApiProperty } from '@nestjs/swagger';

export class VehicleResponseDto {
  @ApiProperty({ example: 'b1f3a2c4-1234-5678-9abc-1234567890ab' })
  id: string;

  @ApiProperty({ example: 'Car (SUV) - 8765' })
  name: string;

  @ApiProperty({ example: 'PB04VS4597' })
  licensePlate: string;

  @ApiProperty({ example: 'RC123456789' })
  rcNumber: string;

  @ApiProperty({ example: 'CHS1234567890' })
  chassisNumber: string;

  @ApiProperty({ example: 'ENG1234567890' })
  engineNumber: string;

  @ApiProperty({ example: 'Internal use only', required: false })
  notes?: string | null;

  @ApiProperty({ example: 'b1f3a2c4-1234-5678-9abc-1234567890ab' })
  categoryId: string;

  @ApiProperty({ example: 'c2d4e5f6-2345-6789-abcd-234567890abc' })
  typeId: string;

  @ApiProperty({
    example: 'd3e5f6g7-3456-789a-bcde-34567890abcd',
    required: false,
  })
  ownerId?: string | null;

  @ApiProperty({
    example: 'e4f6g7h8-4567-89ab-cdef-4567890abcde',
    required: false,
  })
  driverId?: string | null;

  @ApiProperty({
    example: 'f5g7h8i9-5678-9abc-def0-567890abcdef',
    required: false,
  })
  locationId?: string | null;

  @ApiProperty({ example: new Date() })
  createdAt: Date | string;

  @ApiProperty({ example: new Date() })
  updatedAt: Date | string;

  // Add these fields that exist in your API response
  @ApiProperty({ example: 'Car', required: false })
  categoryName?: string | null;

  @ApiProperty({ example: 'SUV', required: false })
  typeName?: string | null;

  @ApiProperty({ example: 'John Doe', required: false })
  ownerName?: string | null;

  @ApiProperty({ example: 'Mike Smith', required: false })
  driverName?: string | null;

  @ApiProperty({ example: 'Main Garage', required: false })
  locationName?: string | null;

  @ApiProperty({ type: [String], required: false })
  documents?: string[];
}

export class PaginatedVehicleResponseDto {
  @ApiProperty({ type: [VehicleResponseDto] })
  items: VehicleResponseDto[];

  @ApiProperty({ example: 150 })
  total: number;
}
