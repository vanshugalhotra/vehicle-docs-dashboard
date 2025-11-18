import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiResponse } from '@nestjs/swagger';

import {
  OverviewQueryDto,
  VehiclesGroupQueryDto,
  CreatedTrendQueryDto,
  ExpiryDistributionQueryDto,
  ExpiringSoonQueryDto,
} from './dto/stats-query.dto';

import {
  OverviewResponseDto,
  CountResponseDto,
  TimeSeriesResponseDto,
  ExpiryBucketResponseDto,
  ExpiringSoonResponseDto,
} from './dto/stats-response.dto';

import { StatsService } from './stats.service';

@ApiTags('Stats')
@Controller({ path: 'stats', version: '1' })
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  // ─────────────────────────────────────────────────────────────
  // 1. OVERVIEW
  // ─────────────────────────────────────────────────────────────
  @Get('overview')
  @ApiResponse({
    status: 200,
    description: 'Returns overall dashboard summary with counts',
    type: OverviewResponseDto,
  })
  async getOverview(
    @Query() query: OverviewQueryDto,
  ): Promise<OverviewResponseDto> {
    return this.statsService.getOverview(query);
  }

  // ─────────────────────────────────────────────────────────────
  // 2. VEHICLES BY CATEGORY
  // ─────────────────────────────────────────────────────────────
  @Get('vehicles/grouped')
  @ApiResponse({
    status: 200,
    description: 'Get vehicle counts grouped by category/location/owner/driver',
    type: [CountResponseDto],
  })
  async getVehiclesGrouped(
    @Query() query: VehiclesGroupQueryDto,
  ): Promise<CountResponseDto[]> {
    return this.statsService.getVehiclesGrouped(query);
  }

  // ─────────────────────────────────────────────────────────────
  // 3. VEHICLE CREATION TREND
  // ─────────────────────────────────────────────────────────────
  @Get('vehicles/created-trend')
  @ApiResponse({
    status: 200,
    description: 'Returns timeseries of created vehicles',
    type: [TimeSeriesResponseDto],
  })
  async getCreatedTrend(
    @Query() query: CreatedTrendQueryDto,
  ): Promise<TimeSeriesResponseDto[]> {
    return this.statsService.getCreatedTrend(query);
  }

  // ─────────────────────────────────────────────────────────────
  // 4. DOCUMENT EXPIRY DISTRIBUTION
  // ─────────────────────────────────────────────────────────────
  @Get('documents/expiry-distribution')
  @ApiResponse({
    status: 200,
    description: 'Document counts grouped by expiry buckets',
    type: [ExpiryBucketResponseDto],
  })
  async getExpiryDistribution(
    @Query() query: ExpiryDistributionQueryDto,
  ): Promise<ExpiryBucketResponseDto[]> {
    return this.statsService.getExpiryDistribution(query);
  }

  // ─────────────────────────────────────────────────────────────
  // 5. EXPIRING SOON DOCUMENTS
  // ─────────────────────────────────────────────────────────────
  @Get('documents/expiring-soon')
  @ApiResponse({
    status: 200,
    description: 'Documents expiring soon with vehicle info',
    type: [ExpiringSoonResponseDto],
  })
  async getExpiringSoon(
    @Query() query: ExpiringSoonQueryDto,
  ): Promise<ExpiringSoonResponseDto[]> {
    return this.statsService.getExpiringSoon(query);
  }
}
