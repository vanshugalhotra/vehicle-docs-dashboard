import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { LoggerService, LogContext } from 'src/common/logger/logger.service';
import { handlePrismaError } from 'src/common/utils/prisma-error-handler';
import {
  OverviewQueryDto,
  VehiclesGroupQueryDto,
  CreatedTrendQueryDto,
  ExpiryDistributionQueryDto,
} from './dto/stats-query.dto';
import {
  OverviewResponseDto,
  CountResponseDto,
  TimeSeriesResponseDto,
  ExpiryBucketResponseDto,
} from './dto/stats-response.dto';
import { Prisma } from '@prisma/client';

interface TrendRow {
  date: string;
  count: number;
}

@Injectable()
export class StatsService {
  private readonly entity = 'Stats';

  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
  ) {}

  private buildVehicleFilter(query: {
    categoryId?: string;
    typeId?: string;
    locationId?: string;
    ownerId?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
  }): Prisma.VehicleWhereInput {
    const {
      categoryId,
      typeId,
      locationId,
      ownerId,
      startDate,
      endDate,
      search,
    } = query;

    const filter: Prisma.VehicleWhereInput = {
      ...(categoryId && { categoryId }),
      ...(typeId && { typeId }),
      ...(locationId && { locationId }),
      ...(ownerId && { ownerId }),
    };

    if (startDate || endDate) {
      const start = startDate ? new Date(startDate) : undefined;
      const end = endDate ? new Date(endDate) : undefined;
      filter.createdAt = {
        ...(start && { gte: start }),
        ...(end && { lte: end }),
      };
    }

    if (search) {
      filter.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { licensePlate: { contains: search, mode: 'insensitive' } },
        { rcNumber: { contains: search, mode: 'insensitive' } },
      ];
    }

    return filter;
  }

  private buildDocumentFilter(
    vehicleFilter: Prisma.VehicleWhereInput,
    additionalFilters: Prisma.VehicleDocumentWhereInput = {},
  ): Prisma.VehicleDocumentWhereInput {
    return { vehicle: vehicleFilter, ...additionalFilters };
  }

  private async getCountsByField(
    field: Prisma.VehicleScalarFieldEnum,
    where: Prisma.VehicleWhereInput,
  ): Promise<CountResponseDto[]> {
    const ctx: LogContext = {
      entity: this.entity,
      action: 'grouped',
      additional: { field, where },
    };
    this.logger.logDebug(`Getting counts by field`, ctx);

    try {
      const grouped = await this.prisma.vehicle.groupBy({
        by: [field],
        where,
        _count: { id: true },
      });

      if (grouped.length === 0) {
        this.logger.logDebug(`No data found for field`, ctx);
        return [];
      }

      const ids = grouped.map((g) => g[field] as string).filter(Boolean);
      const labelsMap = await this.getLabelsForField(field, ids);

      const result = grouped.map((g) => {
        const idKey = g[field] as string | null;
        return {
          label: idKey ? (labelsMap[idKey] ?? 'Unknown') : 'Unassigned',
          count: g._count.id ?? 0,
        };
      });

      this.logger.logDebug(`Retrieved groups for field`, {
        ...ctx,
        additional: { groupCount: result.length },
      });
      return result;
    } catch (error) {
      this.logger.logError(`Error getting counts by field`, {
        ...ctx,
        additional: { error },
      });
      if (error instanceof Prisma.PrismaClientKnownRequestError)
        handlePrismaError(error, this.entity);
      throw error;
    }
  }

  private async getLabelsForField(
    field: Prisma.VehicleScalarFieldEnum,
    ids: string[],
  ): Promise<Record<string, string>> {
    if (ids.length === 0) return {};
    const ctx: LogContext = {
      entity: this.entity,
      action: 'labels',
      additional: { field, ids },
    };

    try {
      switch (field) {
        case 'categoryId': {
          const categories = await this.prisma.vehicleCategory.findMany({
            where: { id: { in: ids } },
            select: { id: true, name: true },
          });
          return Object.fromEntries(categories.map((c) => [c.id, c.name]));
        }
        case 'locationId': {
          const locations = await this.prisma.location.findMany({
            where: { id: { in: ids } },
            select: { id: true, name: true },
          });
          return Object.fromEntries(locations.map((l) => [l.id, l.name]));
        }
        case 'ownerId': {
          const owners = await this.prisma.owner.findMany({
            where: { id: { in: ids } },
            select: { id: true, name: true },
          });
          return Object.fromEntries(owners.map((o) => [o.id, o.name]));
        }
        case 'driverId': {
          const drivers = await this.prisma.driver.findMany({
            where: { id: { in: ids } },
            select: { id: true, name: true },
          });
          return Object.fromEntries(drivers.map((d) => [d.id, d.name]));
        }
        default:
          return {};
      }
    } catch (error) {
      this.logger.logError(`Error getting labels for field`, {
        ...ctx,
        additional: { error },
      });
      return {};
    }
  }

  async getOverview(query: OverviewQueryDto): Promise<OverviewResponseDto> {
    const ctx: LogContext = {
      entity: this.entity,
      action: 'overview',
      additional: { query },
    };
    this.logger.logInfo('Getting stats overview', ctx);

    try {
      const { expiringDays = 30 } = query;
      const now = new Date();
      const soon = new Date(now.getTime() + expiringDays * 86400000);

      const vehicleFilter = this.buildVehicleFilter(query);
      const documentFilter = this.buildDocumentFilter(vehicleFilter);

      this.logger.logDebug('Applying vehicle filter', {
        ...ctx,
        additional: { vehicleFilter },
      });
      this.logger.logDebug('Applying document filter', {
        ...ctx,
        additional: { documentFilter },
      });

      const unassignedVehiclesPromise = this.prisma.vehicle.count({
        where: { ...vehicleFilter, documents: { none: {} } },
      });

      const [
        totalVehicles,
        totalLinkages,
        expiringSoon,
        expired,
        vehicleCreatedTrend,
        unassignedVehicles,
      ] = await Promise.all([
        this.prisma.vehicle.count({ where: vehicleFilter }),
        this.prisma.vehicleDocument.count({ where: documentFilter }),
        this.prisma.vehicleDocument.count({
          where: { ...documentFilter, expiryDate: { gte: now, lte: soon } },
        }),
        this.prisma.vehicleDocument.count({
          where: { ...documentFilter, expiryDate: { lt: now } },
        }),
        this.computeVehicleCreatedTrend(),
        unassignedVehiclesPromise,
      ]);

      const activeLinkages = totalLinkages - expired;
      const complianceRate =
        totalLinkages === 0
          ? 100
          : Math.round((activeLinkages / totalLinkages) * 100 * 100) / 100;

      const result = {
        totalVehicles,
        totalLinkages,
        activeLinkages,
        expiringSoon,
        expired,
        unassignedVehicles,
        complianceRate,
        vehicleCreatedTrend,
      };

      this.logger.logInfo('Stats overview retrieved', {
        ...ctx,
        additional: { totalVehicles, totalLinkages, complianceRate },
      });
      return result;
    } catch (error) {
      this.logger.logError('Error getting stats overview', {
        ...ctx,
        additional: { error },
      });
      if (error instanceof Prisma.PrismaClientKnownRequestError)
        handlePrismaError(error, this.entity);
      throw error;
    }
  }

  private async computeVehicleCreatedTrend(): Promise<TrendRow[]> {
    const ctx: LogContext = { entity: this.entity, action: 'createdTrend' };
    this.logger.logDebug('Computing vehicle created trend', ctx);

    try {
      const result = await this.prisma.$queryRaw<TrendRow[]>`
        SELECT date("createdAt") AS date, COUNT(*)::int AS count
        FROM "vehicles"
        WHERE "createdAt" >= now() - INTERVAL '7 days'
        GROUP BY date("createdAt")
        ORDER BY date("createdAt");
      `;
      this.logger.logDebug(`Retrieved trend data points`, {
        ...ctx,
        additional: { count: result.length },
      });
      return result;
    } catch (error) {
      this.logger.logError('Error computing vehicle created trend', {
        ...ctx,
        additional: { error },
      });
      return [];
    }
  }

  async getVehiclesGrouped(
    query: VehiclesGroupQueryDto,
  ): Promise<CountResponseDto[]> {
    const ctx: LogContext = {
      entity: this.entity,
      action: 'grouped',
      additional: { query },
    };
    this.logger.logInfo('Getting vehicles grouped stats', ctx);

    try {
      const groupFieldMap: Record<string, Prisma.VehicleScalarFieldEnum> = {
        category: 'categoryId',
        location: 'locationId',
        owner: 'ownerId',
        driver: 'driverId',
      };
      const dbField = groupFieldMap[query.groupBy];
      if (!dbField) {
        this.logger.logWarn('Invalid groupBy field', {
          ...ctx,
          additional: { groupBy: query.groupBy },
        });
        throw new Error('Invalid groupBy field');
      }

      const vehicleFilter = this.buildVehicleFilter(query);
      const result = await this.getCountsByField(dbField, vehicleFilter);

      this.logger.logInfo('Retrieved grouped vehicles', {
        ...ctx,
        additional: { groupCount: result.length },
      });
      return result;
    } catch (error) {
      this.logger.logError('Error getting vehicles grouped', {
        ...ctx,
        additional: { error },
      });
      if (error instanceof Prisma.PrismaClientKnownRequestError)
        handlePrismaError(error, this.entity);
      throw error;
    }
  }

  async getCreatedTrend(
    query: CreatedTrendQueryDto,
  ): Promise<TimeSeriesResponseDto[]> {
    const ctx: LogContext = {
      entity: this.entity,
      action: 'createdTrend',
      additional: { query },
    };
    this.logger.logInfo('Getting created trend', ctx);

    try {
      const { startDate, endDate, groupBy = 'day' } = query;
      const now = new Date();
      const start = startDate
        ? new Date(startDate)
        : new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const end = endDate ? new Date(endDate) : now;

      this.logger.logDebug('Date range for trend', {
        ...ctx,
        additional: { start, end, groupBy },
      });

      const intervalSql = (() => {
        switch (groupBy) {
          case 'week':
            return `DATE_TRUNC('week', "createdAt")`;
          case 'month':
            return `DATE_TRUNC('month', "createdAt")`;
          default:
            return `DATE_TRUNC('day', "createdAt")`;
        }
      })();

      const rawResult: { date: Date; count: number }[] = await this.prisma
        .$queryRaw<{ date: Date; count: number }[]>`
          SELECT ${Prisma.sql([intervalSql])} AS date,
                 COUNT(*)::int AS count
          FROM "vehicles"
          WHERE "createdAt" BETWEEN ${start} AND ${end}
          GROUP BY ${Prisma.sql([intervalSql])}
          ORDER BY ${Prisma.sql([intervalSql])};
        `;

      const result = rawResult.map((r) => ({
        date: r.date.toISOString(),
        count: r.count,
      }));
      this.logger.logInfo('Retrieved created trend', {
        ...ctx,
        additional: { dataPoints: result.length },
      });
      return result;
    } catch (error) {
      this.logger.logError('Error getting created trend', {
        ...ctx,
        additional: { error },
      });
      if (error instanceof Prisma.PrismaClientKnownRequestError)
        handlePrismaError(error, this.entity);
      throw error;
    }
  }

  async getExpiryDistribution(
    query: ExpiryDistributionQueryDto,
  ): Promise<ExpiryBucketResponseDto[]> {
    const ctx: LogContext = {
      entity: this.entity,
      action: 'expiryDistribution',
      additional: { query },
    };
    this.logger.logInfo('Getting expiry distribution', ctx);

    try {
      const {
        startDate,
        endDate,
        vehicleId,
        documentTypeId,
        bucketSize = 30,
        maxBucket = 90,
      } = query;

      const vehicleFilter = this.buildVehicleFilter(query);
      const additionalFilters: Prisma.VehicleDocumentWhereInput = {
        ...(startDate && { expiryDate: { gte: new Date(startDate) } }),
        ...(endDate && { expiryDate: { lte: new Date(endDate) } }),
        ...(vehicleId && { vehicleId }),
        ...(documentTypeId && { documentTypeId }),
      };

      const documentFilter = this.buildDocumentFilter(
        vehicleFilter,
        additionalFilters,
      );
      this.logger.logDebug('Fetching documents for expiry distribution', {
        ...ctx,
        additional: { bucketSize, maxBucket, documentFilter },
      });

      const documents = await this.prisma.vehicleDocument.findMany({
        where: documentFilter,
        select: { expiryDate: true },
      });
      this.logger.logDebug(`Found documents for expiry distribution`, {
        ...ctx,
        additional: { documentCount: documents.length },
      });

      const today = new Date();
      const buckets: Record<string, number> = {};
      for (let i = 0; i < maxBucket; i += bucketSize) {
        const start = i + 1;
        const end = Math.min(i + bucketSize, maxBucket);
        buckets[`${start}-${end}`] = 0;
      }
      buckets[`${maxBucket}+`] = 0;

      for (const doc of documents) {
        const days = Math.ceil(
          (doc.expiryDate.getTime() - today.getTime()) / 86400000,
        );
        if (days <= 0) continue;
        if (days > maxBucket) buckets[`${maxBucket}+`]++;
        else {
          const bucketIndex = Math.floor((days - 1) / bucketSize);
          const start = bucketIndex * bucketSize + 1;
          const end = Math.min((bucketIndex + 1) * bucketSize, maxBucket);
          buckets[`${start}-${end}`]++;
        }
      }

      const orderedBuckets: ExpiryBucketResponseDto[] = [
        ...Object.keys(buckets)
          .filter((b) => b !== `${maxBucket}+`)
          .sort(
            (a, b) =>
              parseInt(a.split('-')[0], 10) - parseInt(b.split('-')[0], 10),
          )
          .map((b) => ({ bucket: b, count: buckets[b] })),
        { bucket: `${maxBucket}+`, count: buckets[`${maxBucket}+`] },
      ];

      this.logger.logInfo('Expiry distribution calculated', {
        ...ctx,
        additional: {
          totalDocuments: documents.length,
          bucketCount: orderedBuckets.length,
        },
      });
      return orderedBuckets;
    } catch (error) {
      this.logger.logError('Error getting expiry distribution', {
        ...ctx,
        additional: { error },
      });
      if (error instanceof Prisma.PrismaClientKnownRequestError)
        handlePrismaError(error, this.entity);
      throw error;
    }
  }
}
