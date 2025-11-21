import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
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
  constructor(private readonly prisma: PrismaService) {}

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

    // Date range filter
    if (startDate || endDate) {
      const start = startDate ? new Date(startDate) : undefined;
      const end = endDate ? new Date(endDate) : undefined;
      filter.createdAt = {
        ...(start && { gte: start }),
        ...(end && { lte: end }),
      };
    }

    // Search filter
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
    return {
      vehicle: vehicleFilter,
      ...additionalFilters,
    };
  }

  private async getCountsByField(
    field: Prisma.VehicleScalarFieldEnum,
    where: Prisma.VehicleWhereInput,
  ): Promise<CountResponseDto[]> {
    const grouped = await this.prisma.vehicle.groupBy({
      by: [field],
      where,
      _count: { id: true },
    });

    if (grouped.length === 0) return [];

    const ids = grouped.map((g) => g[field] as string).filter(Boolean);
    const labelsMap = await this.getLabelsForField(field, ids);

    return grouped.map((g) => {
      const idKey = g[field] as string | null;
      return {
        label: idKey ? (labelsMap[idKey] ?? 'Unknown') : 'Unassigned',
        count: g._count.id ?? 0,
      };
    });
  }

  private async getLabelsForField(
    field: Prisma.VehicleScalarFieldEnum,
    ids: string[],
  ): Promise<Record<string, string>> {
    if (ids.length === 0) return {};

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
  }

  async getOverview(query: OverviewQueryDto): Promise<OverviewResponseDto> {
    const { expiringDays = 30 } = query;

    const now = new Date();
    const soon = new Date(now.getTime() + expiringDays * 86400000);

    const vehicleFilter = this.buildVehicleFilter(query);
    const documentFilter = this.buildDocumentFilter(vehicleFilter);

    // VEHICLES WITH NO DOCUMENTS
    const unassignedVehiclesPromise = this.prisma.vehicle.count({
      where: {
        ...vehicleFilter,
        documents: { none: {} },
      },
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
  }

  private async computeVehicleCreatedTrend(): Promise<TrendRow[]> {
    return this.prisma.$queryRaw<TrendRow[]>`
      SELECT date("createdAt") AS date, COUNT(*)::int AS count
      FROM "vehicles"
      WHERE "createdAt" >= now() - INTERVAL '7 days'
      GROUP BY date("createdAt")
      ORDER BY date("createdAt");
    `;
  }

  async getVehiclesGrouped(
    query: VehiclesGroupQueryDto,
  ): Promise<CountResponseDto[]> {
    const { groupBy } = query;

    const groupFieldMap: Record<string, Prisma.VehicleScalarFieldEnum> = {
      category: 'categoryId',
      location: 'locationId',
      owner: 'ownerId',
      driver: 'driverId',
    };

    const dbField = groupFieldMap[groupBy];
    if (!dbField) throw new Error('Invalid groupBy field');

    const vehicleFilter = this.buildVehicleFilter(query);
    return this.getCountsByField(dbField, vehicleFilter);
  }

  async getCreatedTrend(
    query: CreatedTrendQueryDto,
  ): Promise<TimeSeriesResponseDto[]> {
    const { startDate, endDate, groupBy = 'day' } = query;

    const now = new Date();
    const start = startDate
      ? new Date(startDate)
      : new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : now;

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

    return rawResult.map((r) => ({
      date: r.date.toISOString(),
      count: r.count,
    }));
  }

  async getExpiryDistribution(
    query: ExpiryDistributionQueryDto,
  ): Promise<ExpiryBucketResponseDto[]> {
    const {
      startDate,
      endDate,
      vehicleId,
      documentTypeId,
      bucketSize = 30,
      maxBucket = 90,
    } = query;

    const vehicleFilter = this.buildVehicleFilter({});
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
    const documents = await this.prisma.vehicleDocument.findMany({
      where: documentFilter,
      select: { expiryDate: true },
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
      if (days > maxBucket) {
        buckets[`${maxBucket}+`]++;
      } else {
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

    return orderedBuckets;
  }
}
