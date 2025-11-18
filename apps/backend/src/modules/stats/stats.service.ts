import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
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
import { VehicleResponseDto } from '../vehicle/dto/vehicle-response.dto';
import { Prisma, VehicleDocument } from '@prisma/client';
interface TrendRow {
  date: string;
  count: number;
}

@Injectable()
export class StatsService {
  constructor(private readonly prisma: PrismaService) {}
  private parseDate(dateString: string | undefined, fallback: Date): Date {
    if (!dateString) return fallback;
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? fallback : date;
  }

  async getOverview(query: OverviewQueryDto): Promise<OverviewResponseDto> {
    const {
      startDate,
      endDate,
      categoryId,
      typeId,
      locationId,
      ownerId,
      expiringDays = 30,
    } = query;
    const fallbackStart: Date = new Date(Date.now() - 30 * 86400000);
    const start: Date = this.parseDate(startDate, fallbackStart);
    const end: Date = this.parseDate(endDate, new Date());
    const now = new Date();
    const soon = new Date(now.getTime() + expiringDays * 86400000);

    // VEHICLE FILTER
    const vehicleFilter: Prisma.VehicleWhereInput = {
      ...(categoryId && { categoryId }),
      ...(typeId && { typeId }),
      ...(locationId && { locationId }),
      ...(ownerId && { ownerId }),
    };

    // DOCUMENT FILTER
    const documentFilter: Prisma.VehicleDocumentWhereInput = {
      vehicle: vehicleFilter,
    };

    // PARALLEL QUERIES
    const [
      totalVehicles,
      vehiclesByCategoryRaw,
      vehiclesByLocationRaw,
      newVehicles,
      totalDocuments,
      documentsExpiringSoon,
      documentsExpired,
      documentsByTypeRaw,
      expiryDistribution,
      activitySummary,
      vehicleCreatedTrend,
      documentExpiryTrend,
    ] = await Promise.all([
      this.prisma.vehicle.count({ where: vehicleFilter }),

      this.prisma.vehicle.groupBy({
        by: ['categoryId'],
        where: vehicleFilter,
        _count: { id: true },
      }),

      this.prisma.vehicle.groupBy({
        by: ['locationId'],
        where: vehicleFilter,
        _count: { id: true },
      }),

      this.prisma.vehicle.count({
        where: { createdAt: { gte: start, lte: end }, ...vehicleFilter },
      }),

      this.prisma.vehicleDocument.count({ where: documentFilter }),

      this.prisma.vehicleDocument.count({
        where: { ...documentFilter, expiryDate: { gte: now, lte: soon } },
      }),

      this.prisma.vehicleDocument.count({
        where: { ...documentFilter, expiryDate: { lt: now } },
      }),

      this.prisma.vehicleDocument.groupBy({
        by: ['documentTypeId'],
        where: documentFilter,
        _count: { id: true },
      }),

      this.computeExpiryDistribution(documentFilter),

      this.getActivitySummary(),

      this.computeVehicleCreatedTrend(),

      this.computeDocumentExpiryTrend(),
    ]);

    const recentActivityCount =
      activitySummary.created +
      activitySummary.updated +
      activitySummary.deleted;

    const complianceRate =
      totalDocuments === 0
        ? 100
        : ((totalDocuments - documentsExpired) / totalDocuments) * 100;

    return {
      totalVehicles,

      vehiclesByCategory: vehiclesByCategoryRaw.map((x) => ({
        categoryId: x.categoryId,
        count: x._count.id,
      })),

      vehiclesByLocation: vehiclesByLocationRaw.map((x) => ({
        locationId: x.locationId,
        count: x._count.id,
      })),

      newVehicles,
      totalDocuments,
      documentsExpiringSoon,
      documentsExpired,

      documentsByType: documentsByTypeRaw.map((d) => ({
        documentTypeId: d.documentTypeId,
        count: d._count.id,
      })),

      complianceRate,

      expiryDistribution,
      recentActivityCount,
      activitySummary,

      vehicleCreatedTrend,
      documentExpiryTrend,
    };
  }

  private async computeExpiryDistribution(
    filter: Prisma.VehicleDocumentWhereInput,
  ): Promise<{ bucket: string; count: number }[]> {
    const docs: Pick<VehicleDocument, 'expiryDate'>[] =
      await this.prisma.vehicleDocument.findMany({
        where: filter,
        select: { expiryDate: true },
      });

    const now = new Date();

    const bucketMap = {
      '0-30': 0,
      '31-60': 0,
      '61-90': 0,
      '90+': 0,
    };

    for (const doc of docs) {
      const days =
        (new Date(doc.expiryDate).getTime() - now.getTime()) / 86400000;

      if (days <= 30) bucketMap['0-30']++;
      else if (days <= 60) bucketMap['31-60']++;
      else if (days <= 90) bucketMap['61-90']++;
      else bucketMap['90+']++;
    }

    return Object.entries(bucketMap).map(([bucket, count]) => ({
      bucket,
      count,
    }));
  }

  private async getActivitySummary() {
    const [created, updated, deleted] = await Promise.all([
      this.prisma.auditLog.count({ where: { action: 'CREATE' } }),
      this.prisma.auditLog.count({ where: { action: 'UPDATE' } }),
      this.prisma.auditLog.count({ where: { action: 'DELETE' } }),
    ]);

    return { created, updated, deleted };
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

  private async computeDocumentExpiryTrend(): Promise<TrendRow[]> {
    return this.prisma.$queryRaw<TrendRow[]>`
      SELECT date("expiryDate") AS date, COUNT(*)::int AS count
      FROM "vehicle_documents"
      WHERE "expiryDate" >= now()
      GROUP BY date("expiryDate")
      ORDER BY date("expiryDate");
    `;
  }

  async getVehiclesGrouped(
    query: VehiclesGroupQueryDto,
  ): Promise<CountResponseDto[]> {
    const { startDate, endDate, search, groupBy } = query;

    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;

    const where: Prisma.VehicleWhereInput = {
      ...(start && { createdAt: { gte: start } }),
      ...(end && { createdAt: { lte: end } }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { licensePlate: { contains: search, mode: 'insensitive' } },
          { rcNumber: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    // Map to scalar field enum
    const groupFieldMap: Record<string, Prisma.VehicleScalarFieldEnum> = {
      category: 'categoryId',
      location: 'locationId',
      owner: 'ownerId',
      driver: 'driverId',
    };

    const dbField = groupFieldMap[groupBy];
    if (!dbField) throw new Error('Invalid groupBy field');

    // Group vehicles
    const grouped = await this.prisma.vehicle.groupBy({
      by: [dbField],
      where,
      _count: { id: true }, // guarantees g._count.id exists
    });

    if (grouped.length === 0) return [];

    // Fetch labels dynamically
    let labelsMap: Record<string, string> = {};

    switch (groupBy) {
      case 'category': {
        const categories = await this.prisma.vehicleCategory.findMany({
          where: {
            id: { in: grouped.map((g) => g.categoryId).filter(Boolean) },
          },
          select: { id: true, name: true },
        });
        labelsMap = Object.fromEntries(categories.map((c) => [c.id, c.name]));
        break;
      }
      case 'location': {
        const ids = grouped.map((g) => g.locationId!).filter(Boolean);
        const locations = await this.prisma.location.findMany({
          where: { id: { in: ids } },
          select: { id: true, name: true },
        });
        labelsMap = Object.fromEntries(locations.map((l) => [l.id, l.name]));
        break;
      }
      case 'owner': {
        const ids = grouped.map((g) => g.ownerId!).filter(Boolean);
        const owners = await this.prisma.owner.findMany({
          where: { id: { in: ids } },
          select: { id: true, name: true },
        });
        labelsMap = Object.fromEntries(owners.map((o) => [o.id, o.name]));
        break;
      }
      case 'driver': {
        const ids = grouped.map((g) => g.driverId!).filter(Boolean);
        const drivers = await this.prisma.driver.findMany({
          where: { id: { in: ids } },
          select: { id: true, name: true },
        });
        labelsMap = Object.fromEntries(drivers.map((d) => [d.id, d.name]));
        break;
      }
    }

    // Build response
    const response: CountResponseDto[] = grouped.map((g) => {
      const idKey = g[dbField] as string | null;
      return {
        label: idKey ? (labelsMap[idKey] ?? 'Unknown') : 'Unassigned',
        count: g._count.id ?? 0,
      };
    });

    return response;
  }

  async getCreatedTrend(
    query: CreatedTrendQueryDto,
  ): Promise<TimeSeriesResponseDto[]> {
    const { startDate, endDate, groupBy = 'day' } = query;

    // Use native Date, default last 30 days
    const now = new Date();
    const start = startDate
      ? new Date(startDate)
      : new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : now;

    // Map groupBy to SQL DATE_TRUNC
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

    // Query database
    const rawResult: { date: Date; count: number }[] = await this.prisma
      .$queryRaw<{ date: Date; count: number }[]>`
    SELECT ${Prisma.sql([intervalSql])} AS date,
           COUNT(*)::int AS count
    FROM "vehicles"
    WHERE "createdAt" BETWEEN ${start} AND ${end}
    GROUP BY ${Prisma.sql([intervalSql])}
    ORDER BY ${Prisma.sql([intervalSql])};
  `;

    // Map to DTO
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

    const where: Prisma.VehicleDocumentWhereInput = {
      ...(startDate && { expiryDate: { gte: new Date(startDate) } }),
      ...(endDate && { expiryDate: { lte: new Date(endDate) } }),
      ...(vehicleId && { vehicleId }),
      ...(documentTypeId && { documentTypeId }),
    };

    const documents = await this.prisma.vehicleDocument.findMany({
      where,
      select: { expiryDate: true },
    });

    const today = new Date();

    // Initialize buckets
    const buckets: Record<string, number> = {};
    for (let i = 0; i < maxBucket; i += bucketSize) {
      const start = i + 1;
      const end = Math.min(i + bucketSize, maxBucket);
      buckets[`${start}-${end}`] = 0;
    }
    buckets[`${maxBucket}+`] = 0;

    // Assign documents to buckets
    for (const doc of documents) {
      const days = Math.ceil(
        (doc.expiryDate.getTime() - today.getTime()) / 86400000,
      );

      if (days <= 0) continue; // expired already, optional: skip or count in 0 bucket
      if (days > maxBucket) {
        buckets[`${maxBucket}+`]++;
      } else {
        const bucketIndex = Math.floor((days - 1) / bucketSize);
        const start = bucketIndex * bucketSize + 1;
        const end = Math.min((bucketIndex + 1) * bucketSize, maxBucket);
        buckets[`${start}-${end}`]++;
      }
    }

    // Convert to DTO array in order
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

  async getExpiringSoon(
    query: ExpiringSoonQueryDto,
  ): Promise<ExpiringSoonResponseDto[]> {
    const withinDays = query.withinDays ?? 30;
    const today = new Date();
    const futureDate = new Date(
      today.getTime() + withinDays * 24 * 60 * 60 * 1000,
    );

    const documents = await this.prisma.vehicleDocument.findMany({
      where: {
        expiryDate: { gte: today, lte: futureDate },
      },
      include: {
        vehicle: {
          include: {
            category: true,
            type: true,
            owner: true,
            driver: true,
            location: true,
          },
        },
        documentType: true,
      },
    });

    return documents.map((doc) => {
      const daysRemaining = Math.ceil(
        (doc.expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
      );

      const vehicle = doc.vehicle;
      const vehicleDto: VehicleResponseDto = {
        id: vehicle.id,
        name: vehicle.name,
        licensePlate: vehicle.licensePlate,
        rcNumber: vehicle.rcNumber,
        chassisNumber: vehicle.chassisNumber,
        engineNumber: vehicle.engineNumber,
        notes: vehicle.notes,
        categoryId: vehicle.categoryId,
        typeId: vehicle.typeId,
        ownerId: vehicle.ownerId ?? null,
        driverId: vehicle.driverId ?? null,
        locationId: vehicle.locationId ?? null,
        createdAt: vehicle.createdAt,
        updatedAt: vehicle.updatedAt,
        categoryName: vehicle.category?.name ?? null,
        typeName: vehicle.type?.name ?? null,
        ownerName: vehicle.owner?.name ?? null,
        driverName: vehicle.driver?.name ?? null,
        locationName: vehicle.location?.name ?? null,
      };

      return {
        id: doc.id,
        documentNo: doc.documentNo,
        documentTypeId: doc.documentTypeId,
        documentTypeName: doc.documentType?.name ?? '',
        startDate: doc.startDate.toISOString(),
        expiryDate: doc.expiryDate.toISOString(),
        daysRemaining,
        link: doc.link,
        notes: doc.notes,
        createdAt: doc.createdAt.toISOString(),
        updatedAt: doc.updatedAt.toISOString(),
        vehicle: vehicleDto,
      };
    });
  }
}
