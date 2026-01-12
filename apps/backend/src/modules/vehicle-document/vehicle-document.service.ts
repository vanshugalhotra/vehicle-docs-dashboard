import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { LoggerService, LogContext } from 'src/common/logger/logger.service';
import { handlePrismaError } from 'src/common/utils/prisma-error-handler';
import { CreateVehicleDocumentDto } from './dto/create-vehicle-document.dto';
import { UpdateVehicleDocumentDto } from './dto/update-vehicle-document.dto';
import {
  VehicleDocumentResponseDto,
  PaginatedVehicleDocumentResponseDto,
} from './dto/vehicle-document-response.dto';
import { mapVehicleDocumentToResponse } from './vehicle-document.mapper';
import { buildQueryArgs } from 'src/common/utils/query-builder';
import { Prisma } from '@prisma/client';
import { VehicleDocumentValidationService } from './validation/vehicle-document-validation.service';
import { parseBusinessFilters } from 'src/common/business-filters/parser';
import { createLinkageBusinessEngine } from './business-resolver/business-engine.factory';
import { LINKAGE_ALLOWED_BUSINESS_FILTERS } from 'src/common/types';
import { QueryWithBusinessDto } from 'src/common/dto/query-business.dto';
import { AuditService } from '../audit/audit.service';
import { AuditEntity, AuditAction } from 'src/common/types/audit.types';

@Injectable()
export class VehicleDocumentService {
  private readonly entity = 'VehicleDocument';

  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly validationService: VehicleDocumentValidationService,
    private readonly auditService: AuditService,
  ) {}

  // -----------------------
  // CREATE
  // -----------------------
  async create(
    dto: CreateVehicleDocumentDto,
  ): Promise<VehicleDocumentResponseDto> {
    const documentNo = dto.documentNo.toUpperCase();
    const ctx: LogContext = {
      entity: this.entity,
      action: 'create',
      additional: { dto },
    };
    this.logger.logInfo(`Creating vehicle document: ${documentNo}`, ctx);

    const start = new Date(dto.startDate);
    const expiry = new Date(dto.expiryDate);

    try {
      await this.validationService.validateCreate(
        documentNo,
        dto.vehicleId,
        dto.documentTypeId,
        start,
        expiry,
      );

      const created = await this.prisma.vehicleDocument.create({
        data: {
          vehicleId: dto.vehicleId,
          documentTypeId: dto.documentTypeId,
          documentNo,
          startDate: start,
          expiryDate: expiry,
          link: dto.link ?? null,
          notes: dto.notes ?? null,
          amount:
            dto.amount !== undefined && dto.amount !== null
              ? new Prisma.Decimal(dto.amount)
              : null,
        },
        include: { vehicle: true, documentType: true },
      });
      this.logger.logInfo('Vehicle document created', {
        ...ctx,
        additional: { id: created.id },
      });

      // audit
      await this.auditService.record<typeof created>({
        entityType: AuditEntity.VEHICLE_DOCUMENT,
        entityId: created.id,
        action: AuditAction.CREATE,
        actorUserId: null,
        oldRecord: null,
        newRecord: created,
      });

      return mapVehicleDocumentToResponse(created);
    } catch (error) {
      this.logger.logError('Failed to create vehicle document', {
        ...ctx,
        additional: { error },
      });
      if (
        error instanceof Prisma.PrismaClientKnownRequestError ||
        error instanceof Prisma.PrismaClientUnknownRequestError
      ) {
        handlePrismaError(error, this.entity);
      }
      throw error;
    }
  }

  // -----------------------
  // FIND ALL
  // -----------------------
  async findAll(
    query: QueryWithBusinessDto,
  ): Promise<PaginatedVehicleDocumentResponseDto> {
    const ctx: LogContext = {
      entity: this.entity,
      action: 'fetch',
      additional: { query },
    };
    this.logger.logInfo('Fetching vehicle documents', ctx);

    try {
      const { skip, take, where, orderBy } =
        buildQueryArgs<Prisma.VehicleDocumentWhereInput>(query, [
          'documentNo',
          'notes',
        ]);

      const search = query.search;
      const existingOR = Array.isArray(
        (where as Prisma.VehicleDocumentWhereInput)?.OR,
      )
        ? ((where as Prisma.VehicleDocumentWhereInput)
            .OR as Prisma.VehicleDocumentWhereInput[])
        : [];

      const extendedWhere: Prisma.VehicleDocumentWhereInput = {
        ...((where as Prisma.VehicleDocumentWhereInput) || {}),
        ...(search && {
          OR: [
            ...existingOR,
            { documentNo: { contains: search, mode: 'insensitive' } },
            { vehicle: { name: { contains: search, mode: 'insensitive' } } },
          ],
        }),
      };

      // Business filters
      const parsedBusinessFilters = parseBusinessFilters(
        query.businessFilters,
        LINKAGE_ALLOWED_BUSINESS_FILTERS,
      );
      const engine = createLinkageBusinessEngine();

      const [docs, total] = await Promise.all([
        this.prisma.vehicleDocument.findMany({
          where: extendedWhere,
          include: { vehicle: true, documentType: true },
          skip,
          take,
          orderBy,
        }),
        this.prisma.vehicleDocument.count({ where: extendedWhere }),
      ]);

      this.logger.logInfo(
        `Fetched ${docs.length} of ${total} vehicle documents`,
        ctx,
      );

      const dtoList = docs.map(mapVehicleDocumentToResponse);
      const finalList = engine.apply(dtoList, parsedBusinessFilters);

      return { items: finalList, total };
    } catch (error) {
      this.logger.logError('Failed to fetch vehicle documents', {
        ...ctx,
        additional: { error },
      });
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        handlePrismaError(error, this.entity);
      }
      throw error;
    }
  }

  // -----------------------
  // FIND ONE
  // -----------------------
  async findOne(id: string): Promise<VehicleDocumentResponseDto> {
    const ctx: LogContext = {
      entity: this.entity,
      action: 'fetch',
      additional: { id },
    };
    this.logger.logInfo(`Fetching vehicle document by id: ${id}`, ctx);

    try {
      const doc = await this.prisma.vehicleDocument.findUnique({
        where: { id },
        include: { vehicle: true, documentType: true },
      });

      if (!doc) {
        this.logger.logWarn('Vehicle document not found', ctx);
        throw new NotFoundException(`VehicleDocument with id ${id} not found`);
      }

      return mapVehicleDocumentToResponse(doc);
    } catch (error) {
      this.logger.logError('Failed to fetch vehicle document', {
        ...ctx,
        additional: { error },
      });
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        handlePrismaError(error, this.entity);
      }
      throw error;
    }
  }

  // -----------------------
  // UPDATE
  // -----------------------
  async update(
    id: string,
    dto: UpdateVehicleDocumentDto,
  ): Promise<VehicleDocumentResponseDto> {
    const ctx: LogContext = {
      entity: this.entity,
      action: 'update',
      additional: { id, dto },
    };
    this.logger.logInfo(`Updating vehicle document: ${id}`, ctx);

    try {
      const { start, expiry } = await this.validationService.validateUpdate(
        id,
        dto.documentNo,
        dto.vehicleId,
        dto.documentTypeId,
        dto.startDate ? new Date(dto.startDate) : undefined,
        dto.expiryDate ? new Date(dto.expiryDate) : undefined,
      );
      // get record before update
      const before = await this.prisma.vehicleDocument.findUnique({
        where: { id },
        include: { vehicle: true, documentType: true },
      });

      if (!before)
        throw new NotFoundException(`VehicleDocument with id ${id} not found`);

      const updated = await this.prisma.vehicleDocument.update({
        where: { id },
        data: {
          documentNo: dto.documentNo?.toUpperCase() ?? undefined,
          startDate: start,
          expiryDate: expiry,
          link: dto.link ?? undefined,
          notes: dto.notes ?? undefined,
          amount:
            dto.amount !== undefined && dto.amount !== null
              ? new Prisma.Decimal(dto.amount)
              : null,
          vehicleId: dto.vehicleId ?? undefined,
          documentTypeId: dto.documentTypeId ?? undefined,
        },
        include: { vehicle: true, documentType: true },
      });

      this.logger.logInfo('Vehicle document updated', {
        ...ctx,
        additional: { updatedId: updated.id },
      });

      // audit
      await this.auditService.record<typeof before>({
        entityType: AuditEntity.VEHICLE_DOCUMENT,
        entityId: updated.id,
        action: AuditAction.UPDATE,
        actorUserId: null,
        oldRecord: before,
        newRecord: updated,
      });

      return mapVehicleDocumentToResponse(updated);
    } catch (error) {
      this.logger.logError('Failed to update vehicle document', {
        ...ctx,
        additional: { error },
      });
      if (
        error instanceof Prisma.PrismaClientKnownRequestError ||
        error instanceof Prisma.PrismaClientUnknownRequestError
      ) {
        handlePrismaError(error, this.entity);
      }
      throw error;
    }
  }

  // -----------------------
  // REMOVE
  // -----------------------
  async remove(id: string): Promise<{ success: boolean }> {
    const ctx: LogContext = {
      entity: this.entity,
      action: 'delete',
      additional: { id },
    };
    this.logger.logInfo(`Deleting vehicle document: ${id}`, ctx);

    try {
      const doc = await this.prisma.vehicleDocument.findUnique({
        where: { id },
        include: { vehicle: true, documentType: true },
      });

      if (!doc) {
        this.logger.logWarn('Vehicle document not found', ctx);
        throw new NotFoundException(`VehicleDocument with id ${id} not found`);
      }

      await this.prisma.vehicleDocument.delete({ where: { id } });
      this.logger.logInfo('Vehicle document deleted', ctx);

      // audit
      await this.auditService.record<typeof doc>({
        entityType: AuditEntity.VEHICLE_DOCUMENT,
        entityId: id,
        action: AuditAction.DELETE,
        actorUserId: null,
        oldRecord: doc,
        newRecord: null,
      });

      return { success: true };
    } catch (error) {
      this.logger.logError('Failed to delete vehicle document', {
        ...ctx,
        additional: { error },
      });
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        handlePrismaError(error, this.entity);
      }
      throw error;
    }
  }
}
