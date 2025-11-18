import { ApiProperty } from '@nestjs/swagger';

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
