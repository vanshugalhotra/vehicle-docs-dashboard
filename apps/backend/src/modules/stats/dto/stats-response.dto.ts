import { ApiProperty } from '@nestjs/swagger';

export class BaseCountDto {
  @ApiProperty() count!: number;
  @ApiProperty({ required: false }) label?: string;
}
export class CountResponseDto extends BaseCountDto {
  @ApiProperty({ description: 'Label for the group (e.g., category name)' })
  declare label: string;
}
export class BucketCount {
  @ApiProperty() bucket!: string;
  @ApiProperty() count!: number;
}

export class TrendRowDto {
  @ApiProperty() date!: string;
  @ApiProperty() count!: number;
}

export class OverviewResponseDto {
  @ApiProperty() totalVehicles!: number;

  @ApiProperty() totalLinkages!: number;

  @ApiProperty() activeLinkages!: number;

  @ApiProperty() expiringSoon!: number;

  @ApiProperty() expired!: number;

  @ApiProperty() unassignedVehicles!: number;

  @ApiProperty() complianceRate!: number;

  @ApiProperty({ type: [TrendRowDto] })
  vehicleCreatedTrend!: TrendRowDto[];
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
