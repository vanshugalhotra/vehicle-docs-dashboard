import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { OverviewQueryDto } from './dto/stats-query.dto';
import { OverviewResponseDto } from './dto/stats-response.dto';
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
}
