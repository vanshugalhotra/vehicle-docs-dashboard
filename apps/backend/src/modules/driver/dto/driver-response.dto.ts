import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class DriverResponseDto {
  @ApiProperty({
    description: 'Unique identifier for the driver',
    example: '4c3f1b19-4f2e-4f17-8b8f-1b6d48b2a8b3',
  })
  id: string;

  @ApiProperty({
    description: 'Name of the driver',
    example: 'Ravi Sharma',
  })
  name: string;

  @ApiProperty({
    description: 'Phone number of the driver',
    example: '9876543210',
  })
  phone: string;

  @ApiPropertyOptional({
    description: 'Email of the driver (if available)',
    example: 'ravi.sharma@example.com',
  })
  email?: string;

  @ApiProperty({
    description: 'Record creation timestamp',
    example: '2025-10-14T09:45:22.123Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Record last update timestamp',
    example: '2025-10-14T09:45:22.123Z',
  })
  updatedAt: Date;
}
