import { ApiProperty } from '@nestjs/swagger';
import { VehicleResponseDto } from 'src/modules/vehicle/dto/vehicle-response.dto';

export class VehicleCountByCategory {
  @ApiProperty() categoryId!: string;
  @ApiProperty() count!: number;
}

export class VehicleCountByLocation {
  @ApiProperty() locationId!: string | null;
  @ApiProperty() count!: number;
}

export class DocumentCountByType {
  @ApiProperty() documentTypeId!: string;
  @ApiProperty() count!: number;
}

export class BucketCount {
  @ApiProperty() bucket!: string;
  @ApiProperty() count!: number;
}

export class TrendRowDto {
  @ApiProperty() date!: string;
  @ApiProperty() count!: number;
}

export class ActivitySummaryDto {
  @ApiProperty() created!: number;
  @ApiProperty() updated!: number;
  @ApiProperty() deleted!: number;
}

export class OverviewResponseDto {
  @ApiProperty() totalVehicles!: number;

  @ApiProperty({ type: [VehicleCountByCategory] })
  vehiclesByCategory!: VehicleCountByCategory[];

  @ApiProperty({ type: [VehicleCountByLocation] })
  vehiclesByLocation!: VehicleCountByLocation[];

  @ApiProperty() newVehicles!: number;

  @ApiProperty() totalDocuments!: number;
  @ApiProperty() documentsExpiringSoon!: number;
  @ApiProperty() documentsExpired!: number;

  @ApiProperty({ type: [DocumentCountByType] })
  documentsByType!: DocumentCountByType[];

  @ApiProperty() complianceRate!: number;

  @ApiProperty({ type: [BucketCount] })
  expiryDistribution!: BucketCount[];

  @ApiProperty() recentActivityCount!: number;

  @ApiProperty({ type: ActivitySummaryDto })
  activitySummary!: ActivitySummaryDto;

  @ApiProperty({ type: [TrendRowDto] })
  vehicleCreatedTrend!: TrendRowDto[];

  @ApiProperty({ type: [TrendRowDto] })
  documentExpiryTrend!: TrendRowDto[];
}

export class CountResponseDto {
  @ApiProperty({ description: 'Label for the group (e.g., category name)' })
  label!: string;

  @ApiProperty({ description: 'Count for this group' })
  count!: number;
}

export class TimeSeriesResponseDto {
  @ApiProperty({ description: 'ISO date representing the bucket start' })
  date!: string;

  @ApiProperty({ description: 'Count of vehicles in this bucket' })
  count!: number;
}

export class ExpiryBucketResponseDto {
  @ApiProperty({ description: 'Label of the bucket, e.g., "0-30", "31-60"' })
  bucket!: string;

  @ApiProperty({ description: 'Number of documents in this bucket' })
  count!: number;
}

export class ExpiringSoonResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  documentNo: string;

  @ApiProperty()
  documentTypeId: string;

  @ApiProperty()
  documentTypeName: string;

  @ApiProperty()
  startDate: string;

  @ApiProperty()
  expiryDate: string;

  @ApiProperty({ description: 'Days remaining until expiry' })
  daysRemaining: number;

  @ApiProperty({ required: false })
  link?: string | null;

  @ApiProperty({ required: false })
  notes?: string | null;

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  updatedAt: string;

  @ApiProperty({ type: () => VehicleResponseDto })
  vehicle: VehicleResponseDto;
}
