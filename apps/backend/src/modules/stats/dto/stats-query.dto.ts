import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsUUID,
  IsInt,
  Min,
  IsDateString,
  IsString,
  IsIn,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';

export class OverviewQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  typeId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  locationId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  ownerId?: string;

  @ApiPropertyOptional({
    description: 'Start date range for filtering vehicle creation',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'End date range for filtering vehicle creation',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Count documents expiring within the next X days',
    example: 30,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  expiringDays?: number = 30;
}

export class VehiclesGroupQueryDto {
  @ApiPropertyOptional({
    description: 'Filter vehicles created after this date (ISO string)',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'Filter vehicles created before this date (ISO string)',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Optional search keyword for vehicle name or identifiers',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({
    description: 'Field to group by: "category", "location", "owner", "driver"',
    enum: ['category', 'location', 'owner', 'driver'],
  })
  @IsIn(['category', 'location', 'owner', 'driver'])
  groupBy!: 'category' | 'location' | 'owner' | 'driver';
}

export class CreatedTrendQueryDto {
  @ApiPropertyOptional({ description: 'Start date for trend (ISO string)' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'End date for trend (ISO string)' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Group by day/week/month',
    enum: ['day', 'week', 'month'],
    default: 'day',
  })
  @IsOptional()
  @IsIn(['day', 'week', 'month'])
  groupBy?: 'day' | 'week' | 'month';
}

export class ExpiryDistributionQueryDto {
  @ApiPropertyOptional({
    description: 'Filter documents with expiryDate >= this ISO date',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'Filter documents with expiryDate <= this ISO date',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ description: 'Filter by vehicle ID (UUID)' })
  @IsOptional()
  @IsUUID()
  vehicleId?: string;

  @ApiPropertyOptional({ description: 'Filter by document type ID (UUID)' })
  @IsOptional()
  @IsUUID()
  documentTypeId?: string;

  @ApiPropertyOptional({
    description: 'Size of each bucket in days (default = 30)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  bucketSize?: number;

  @ApiPropertyOptional({ description: 'Maximum bucket in days (default = 90)' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  maxBucket?: number;
}

export class ExpiringSoonQueryDto {
  @ApiProperty({
    description: 'Number of days ahead to check for expiring documents',
    required: false,
    default: 30,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  withinDays?: number;
}
