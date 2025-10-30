import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsUUID,
  IsDateString,
  IsOptional,
  MaxLength,
  Matches,
  IsUrl,
} from 'class-validator';

export class CreateVehicleDocumentDto {
  @ApiProperty({
    description: 'Vehicle ID to which this document belongs',
    example: 'a3f1c2d4-5678-9abc-def0-1234567890ab',
  })
  @IsUUID()
  vehicleId: string;

  @ApiProperty({
    description:
      'Document type ID (e.g., Insurance, RC, Pollution Certificate)',
    example: 'b4e2f3g5-6789-abcd-ef01-234567890abc',
  })
  @IsUUID()
  documentTypeId: string;

  @ApiProperty({
    description: 'Unique document number (e.g., policy number, RC number)',
    example: 'DOC-INS-1234567890',
  })
  @IsString()
  @Matches(/^[a-zA-Z0-9\s/._-]+$/, {
    message:
      'documentNo can contain letters, numbers, spaces, slashes, dots, hyphens, and underscores',
  })
  @MaxLength(50) // Reduced from 100 for better UX
  documentNo: string;

  @ApiProperty({
    description: 'Start date of document validity',
    example: '2025-01-01',
  })
  @IsDateString()
  startDate: string | Date;

  @ApiProperty({
    description: 'Expiry date of document validity',
    example: '2026-01-01',
  })
  @IsDateString()
  expiryDate: string | Date;

  @ApiProperty({
    description: 'Optional URL link to document (e.g., cloud storage link)',
    example: 'https://example.com/docs/insurance-123.pdf',
    required: false,
  })
  @IsOptional()
  @IsUrl({}, { message: 'link must be a valid URL' })
  link?: string;

  @ApiProperty({
    description: 'Optional notes about the document',
    example: 'Uploaded via system scan, verify before renewal.',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}
