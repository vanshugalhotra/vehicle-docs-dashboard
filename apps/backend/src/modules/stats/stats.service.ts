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

  /* ================= FILTER BUILDERS ================= */

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
      filter.createdAt = {
        ...(startDate && { gte: new Date(startDate) }),
        ...(endDate && { lte: new Date(endDate) }),
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
    additional: Prisma.VehicleDocumentWhereInput = {},
  ): Prisma.VehicleDocumentWhereInput {
    return { vehicle: vehicleFilter, ...additional };
  }

  /* ================= INTERNAL HELPERS (NO INFO LOGS) ================= */

  private async getCountsByField(
    field: Prisma.VehicleScalarFieldEnum,
    where: Prisma.VehicleWhereInput,
  ): Promise<CountResponseDto[]> {
    try {
      const grouped = await this.prisma.vehicle.groupBy({
        by: [field],
        where,
        _count: { id: true },
      });

      if (!grouped.length) return [];

      const ids = grouped.map((g) => g[field] as string).filter(Boolean);
      const labelsMap = await this.getLabelsForField(field, ids);

      return grouped.map((g) => {
        const id = g[field] as string | null;
        return {
          label: id ? (labelsMap[id] ?? 'Unknown') : 'Unassigned',
          count: g._count.id ?? 0,
        };
      });
    } catch (error) {
      this.logger.logError(
        'Failed grouping vehicles',
        {
          entity: this.entity,
          action: 'groupBy',
        },
        error,
      );

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        handlePrismaError(error, this.entity);
      }
      throw error;
    }
  }

  private async getLabelsForField(
    field: Prisma.VehicleScalarFieldEnum,
    ids: string[],
  ): Promise<Record<string, string>> {
    if (!ids.length) return {};

    try {
      switch (field) {
        case 'categoryId':
          return Object.fromEntries(
            (
              await this.prisma.vehicleCategory.findMany({
                where: { id: { in: ids } },
                select: { id: true, name: true },
              })
            ).map((c) => [c.id, c.name]),
          );

        case 'locationId':
          return Object.fromEntries(
            (
              await this.prisma.location.findMany({
                where: { id: { in: ids } },
                select: { id: true, name: true },
              })
            ).map((l) => [l.id, l.name]),
          );

        case 'ownerId':
          return Object.fromEntries(
            (
              await this.prisma.owner.findMany({
                where: { id: { in: ids } },
                select: { id: true, name: true },
              })
            ).map((o) => [o.id, o.name]),
          );

        case 'driverId':
          return Object.fromEntries(
            (
              await this.prisma.driver.findMany({
                where: { id: { in: ids } },
                select: { id: true, name: true },
              })
            ).map((d) => [d.id, d.name]),
          );

        default:
          return {};
      }
    } catch {
      return {};
    }
  }

  /* ================= PUBLIC METHODS ================= */

  async getOverview(query: OverviewQueryDto): Promise<OverviewResponseDto> {
    const ctx: LogContext = { entity: this.entity, action: 'overview' };
    this.logger.logInfo('Fetching stats overview', ctx);

    try {
      const { expiringDays = 30 } = query;
      const now = new Date();
      const soon = new Date(now.getTime() + expiringDays * 86400000);

      const vehicleFilter = this.buildVehicleFilter(query);
      const documentFilter = this.buildDocumentFilter(vehicleFilter);

      this.logger.logDebug('Overview filters resolved', {
        ...ctx,
        additional: { vehicleFilter, documentFilter },
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
        this.prisma.vehicle.count({
          where: { ...vehicleFilter, documents: { none: {} } },
        }),
      ]);

      const activeLinkages = totalLinkages - expired;
      const complianceRate =
        totalLinkages === 0
          ? 100
          : Math.round((activeLinkages / totalLinkages) * 10000) / 100;

      this.logger.logInfo('Stats overview ready', {
        ...ctx,
        additional: { totalVehicles, complianceRate },
      });

      return {
        totalVehicles,
        totalLinkages,
        activeLinkages,
        expiringSoon,
        expired,
        unassignedVehicles,
        complianceRate,
        vehicleCreatedTrend,
      };
    } catch (error) {
      this.logger.logError('Failed fetching stats overview', ctx, error);
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        handlePrismaError(error, this.entity);
      }
      throw error;
    }
  }

  private async computeVehicleCreatedTrend(): Promise<TrendRow[]> {
    try {
      return await this.prisma.$queryRaw<TrendRow[]>`
        SELECT date("createdAt") AS date, COUNT(*)::int AS count
        FROM "vehicles"
        WHERE "createdAt" >= now() - INTERVAL '7 days'
        GROUP BY date("createdAt")
        ORDER BY date("createdAt");
      `;
    } catch {
      return [];
    }
  }

  async getVehiclesGrouped(
    query: VehiclesGroupQueryDto,
  ): Promise<CountResponseDto[]> {
    const ctx: LogContext = { entity: this.entity, action: 'grouped' };
    this.logger.logInfo('Fetching grouped vehicle stats', ctx);

    const fieldMap: Record<string, Prisma.VehicleScalarFieldEnum> = {
      category: 'categoryId',
      location: 'locationId',
      owner: 'ownerId',
      driver: 'driverId',
    };

    const dbField = fieldMap[query.groupBy];
    if (!dbField) {
      this.logger.logWarn('Invalid groupBy field', {
        ...ctx,
        additional: { groupBy: query.groupBy },
      });
      throw new Error('Invalid groupBy field');
    }

    try {
      const filter = this.buildVehicleFilter(query);
      const result = await this.getCountsByField(dbField, filter);

      this.logger.logInfo('Grouped vehicle stats ready', {
        ...ctx,
        additional: { groups: result.length },
      });

      return result;
    } catch (error) {
      this.logger.logError('Failed fetching grouped vehicles', ctx, error);
      throw error;
    }
  }

  async getCreatedTrend(
    query: CreatedTrendQueryDto,
  ): Promise<TimeSeriesResponseDto[]> {
    const ctx: LogContext = { entity: this.entity, action: 'createdTrend' };
    this.logger.logInfo('Fetching created trend', ctx);

    try {
      const { startDate, endDate, groupBy = 'day' } = query;
      const now = new Date();

      const start = startDate
        ? new Date(startDate)
        : new Date(now.getTime() - 30 * 86400000);
      const end = endDate ? new Date(endDate) : now;

      this.logger.logDebug('Created trend range', {
        ...ctx,
        additional: { start, end, groupBy },
      });

      const interval =
        groupBy === 'month'
          ? `DATE_TRUNC('month', "createdAt")`
          : groupBy === 'week'
            ? `DATE_TRUNC('week', "createdAt")`
            : `DATE_TRUNC('day', "createdAt")`;

      const raw = await this.prisma.$queryRaw<{ date: Date; count: number }[]>`
        SELECT ${Prisma.sql([interval])} AS date, COUNT(*)::int AS count
        FROM "vehicles"
        WHERE "createdAt" BETWEEN ${start} AND ${end}
        GROUP BY ${Prisma.sql([interval])}
        ORDER BY ${Prisma.sql([interval])};
      `;

      return raw.map((r) => ({
        date: r.date.toISOString(),
        count: r.count,
      }));
    } catch (error) {
      this.logger.logError('Failed fetching created trend', ctx, error);
      throw error;
    }
  }

  async getExpiryDistribution(
    query: ExpiryDistributionQueryDto,
  ): Promise<ExpiryBucketResponseDto[]> {
    const ctx: LogContext = {
      entity: this.entity,
      action: 'expiryDistribution',
    };
    this.logger.logInfo('Fetching expiry distribution', ctx);

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
      const documentFilter = this.buildDocumentFilter(vehicleFilter, {
        ...(startDate && { expiryDate: { gte: new Date(startDate) } }),
        ...(endDate && { expiryDate: { lte: new Date(endDate) } }),
        ...(vehicleId && { vehicleId }),
        ...(documentTypeId && { documentTypeId }),
      });

      this.logger.logDebug('Expiry distribution filters', {
        ...ctx,
        additional: { bucketSize, maxBucket },
      });

      const documents = await this.prisma.vehicleDocument.findMany({
        where: documentFilter,
        select: { expiryDate: true },
      });

      const today = new Date();
      const buckets: Record<string, number> = {};

      for (let i = 0; i < maxBucket; i += bucketSize) {
        buckets[`${i + 1}-${Math.min(i + bucketSize, maxBucket)}`] = 0;
      }
      buckets[`${maxBucket}+`] = 0;

      for (const doc of documents) {
        const days = Math.ceil(
          (doc.expiryDate.getTime() - today.getTime()) / 86400000,
        );
        if (days <= 0) continue;
        if (days > maxBucket) buckets[`${maxBucket}+`]++;
        else {
          const index = Math.floor((days - 1) / bucketSize);
          const start = index * bucketSize + 1;
          const end = Math.min((index + 1) * bucketSize, maxBucket);
          buckets[`${start}-${end}`]++;
        }
      }

      return [
        ...Object.keys(buckets)
          .filter((b) => b !== `${maxBucket}+`)
          .sort((a, b) => parseInt(a.split('-')[0]) - parseInt(b.split('-')[0]))
          .map((b) => ({ bucket: b, count: buckets[b] })),
        { bucket: `${maxBucket}+`, count: buckets[`${maxBucket}+`] },
      ];
    } catch (error) {
      this.logger.logError('Failed fetching expiry distribution', ctx, error);
      throw error;
    }
  }
}
