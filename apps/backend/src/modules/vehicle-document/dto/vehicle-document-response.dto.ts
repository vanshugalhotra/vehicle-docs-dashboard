import { ApiProperty } from '@nestjs/swagger';

export class VehicleDocumentResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-5678-90ab-cdef-1234567890ab' })
  id: string;

  @ApiProperty({ example: 'DOC-INS-1234567890' })
  documentNo: string;

  @ApiProperty({ example: 'Insurance' })
  documentTypeName: string;

  @ApiProperty({ example: 'Toyota Fortuner' })
  vehicleName: string;

  @ApiProperty({ example: '2025-01-01' })
  startDate: Date | string;

  @ApiProperty({ example: '2026-01-01' })
  expiryDate: Date | string;

  @ApiProperty({ example: 75, description: 'Days remaining until expiry' })
  daysRemaining: number;

  @ApiProperty({
    example: 'https://example.com/docs/insurance-123.pdf',
    required: false,
  })
  link?: string | null;

  @ApiProperty({
    example: 'Uploaded by Admin',
    required: false,
  })
  notes?: string | null;

  @ApiProperty({
    example: '15000.50',
    required: false,
  })
  amount?: string | null;

  @ApiProperty({ example: '2025-01-20T10:30:00.000Z' })
  createdAt: Date | string;

  @ApiProperty({ example: '2025-01-21T10:30:00.000Z' })
  updatedAt: Date | string;

  @ApiProperty({
    example: 'a3f1c2d4-5678-9abc-def0-1234567890ab',
    description: 'Vehicle ID reference',
  })
  vehicleId: string;

  @ApiProperty({
    example: 'b4e2f3g5-6789-abcd-ef01-234567890abc',
    description: 'Document Type ID reference',
  })
  documentTypeId: string;
}

export class PaginatedVehicleDocumentResponseDto {
  @ApiProperty({ type: [VehicleDocumentResponseDto] })
  items: VehicleDocumentResponseDto[];

  @ApiProperty({ example: 42 })
  total: number;
}
