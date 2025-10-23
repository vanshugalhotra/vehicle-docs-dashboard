import { ApiProperty } from '@nestjs/swagger';

export class LocationResponseDto {
  @ApiProperty({
    description: 'Unique identifier',
    example: 'b1f90ad9-2c7b-4c6a-83c9-82aa44c1f110',
  })
  id: string;

  @ApiProperty({
    description: 'Name of the location',
    example: 'Warehouse A',
  })
  name: string;

  @ApiProperty({
    description: 'Record creation timestamp',
    example: '2025-10-14T09:45:22.123Z',
  })
  createdAt: string | Date;

  @ApiProperty({
    description: 'Record last update timestamp',
    example: '2025-10-14T09:45:22.123Z',
  })
  updatedAt: string | Date;
}

export class PaginatedLocationResponseDto {
  @ApiProperty({ type: [LocationResponseDto] })
  items: LocationResponseDto[];

  @ApiProperty({ example: 150 })
  total: number;
}
