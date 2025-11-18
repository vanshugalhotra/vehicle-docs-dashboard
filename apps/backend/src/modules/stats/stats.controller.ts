import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiResponse } from '@nestjs/swagger';

import {
  OverviewQueryDto,
  VehiclesByCategoryQueryDto,
  //   VehiclesByLocationQueryDto,
  //   CreatedTrendQueryDto,
  //   ExpiryDistributionQueryDto,
  //   ExpiringSoonQueryDto,
  //   DocumentsByTypeQueryDto,
  //   RecentActivityQueryDto,
  //   ActivitySummaryQueryDto,
} from './dto/stats-query.dto';

import {
  OverviewResponseDto,
  CountResponseDto,
  //   TimeSeriesResponseDto,
  //   ExpiryBucketResponseDto,
  //   ExpiringSoonResponseDto,
  //   RecentActivityResponseDto,
  //   ActivitySummaryResponseDto,
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
  @Get('vehicles/by-category')
  @ApiResponse({
    status: 200,
    description: 'Counts of vehicles grouped by category',
    type: [CountResponseDto],
  })
  async getVehiclesByCategory(
    @Query() query: VehiclesByCategoryQueryDto,
  ): Promise<CountResponseDto[]> {
    return this.statsService.getVehiclesByCategory(query);
  }

  //   // ─────────────────────────────────────────────────────────────
  //   // 3. VEHICLES BY LOCATION
  //   // ─────────────────────────────────────────────────────────────
  //   @Get('vehicles/by-location')
  //   @ApiResponse({
  //     status: 200,
  //     description: 'Counts of vehicles grouped by location',
  //     type: [CountResponseDto],
  //   })
  //   async getVehiclesByLocation(
  //     @Query() query: VehiclesByLocationQueryDto,
  //   ): Promise<CountResponseDto[]> {
  //     return this.statsService.getVehiclesByLocation(query);
  //   }

  //   // ─────────────────────────────────────────────────────────────
  //   // 4. VEHICLE CREATION TREND
  //   // ─────────────────────────────────────────────────────────────
  //   @Get('vehicles/created-trend')
  //   @ApiResponse({
  //     status: 200,
  //     description: 'Returns timeseries of created vehicles',
  //     type: [TimeSeriesResponseDto],
  //   })
  //   async getCreatedTrend(
  //     @Query() query: CreatedTrendQueryDto,
  //   ): Promise<TimeSeriesResponseDto[]> {
  //     return this.statsService.getCreatedTrend(query);
  //   }

  //   // ─────────────────────────────────────────────────────────────
  //   // 5. DOCUMENT EXPIRY DISTRIBUTION
  //   // ─────────────────────────────────────────────────────────────
  //   @Get('documents/expiry-distribution')
  //   @ApiResponse({
  //     status: 200,
  //     description: 'Document counts grouped by expiry buckets',
  //     type: [ExpiryBucketResponseDto],
  //   })
  //   async getExpiryDistribution(
  //     @Query() query: ExpiryDistributionQueryDto,
  //   ): Promise<ExpiryBucketResponseDto[]> {
  //     return this.statsService.getExpiryDistribution(query);
  //   }

  //   // ─────────────────────────────────────────────────────────────
  //   // 6. EXPIRING SOON DOCUMENTS
  //   // ─────────────────────────────────────────────────────────────
  //   @Get('documents/expiring-soon')
  //   @ApiResponse({
  //     status: 200,
  //     description: 'Documents expiring soon with vehicle info',
  //     type: [ExpiringSoonResponseDto],
  //   })
  //   async getExpiringSoon(
  //     @Query() query: ExpiringSoonQueryDto,
  //   ): Promise<ExpiringSoonResponseDto[]> {
  //     return this.statsService.getExpiringSoon(query);
  //   }

  //   // ─────────────────────────────────────────────────────────────
  //   // 7. DOCUMENTS BY TYPE
  //   // ─────────────────────────────────────────────────────────────
  //   @Get('documents/by-type')
  //   @ApiResponse({
  //     status: 200,
  //     description: 'Counts of documents grouped by document type',
  //     type: [CountResponseDto],
  //   })
  //   async getDocumentsByType(
  //     @Query() query: DocumentsByTypeQueryDto,
  //   ): Promise<CountResponseDto[]> {
  //     return this.statsService.getDocumentsByType(query);
  //   }

  //   // ─────────────────────────────────────────────────────────────
  //   // 8. RECENT ACTIVITY
  //   // ─────────────────────────────────────────────────────────────
  //   @Get('activity/recent')
  //   @ApiResponse({
  //     status: 200,
  //     description: 'Recent activity feed (created/updated items)',
  //     type: [RecentActivityResponseDto],
  //   })
  //   async getRecentActivity(
  //     @Query() query: RecentActivityQueryDto,
  //   ): Promise<RecentActivityResponseDto[]> {
  //     return this.statsService.getRecentActivity(query);
  //   }

  //   // ─────────────────────────────────────────────────────────────
  //   // 9. ACTIVITY SUMMARY
  //   // ─────────────────────────────────────────────────────────────
  //   @Get('activity/summary')
  //   @ApiResponse({
  //     status: 200,
  //     description: 'Summary counts of activities (e.g. created items)',
  //     type: ActivitySummaryResponseDto,
  //   })
  //   async getActivitySummary(
  //     @Query() query: ActivitySummaryQueryDto,
  //   ): Promise<ActivitySummaryResponseDto> {
  //     return this.statsService.getActivitySummary(query);
  //   }
}
