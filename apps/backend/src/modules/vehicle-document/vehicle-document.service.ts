import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { LoggerService } from 'src/common/logger/logger.service';
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

@Injectable()
export class VehicleDocumentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly validationService: VehicleDocumentValidationService,
  ) {}

  // -----------------------
  // CREATE
  // -----------------------
  async create(
    dto: CreateVehicleDocumentDto,
  ): Promise<VehicleDocumentResponseDto> {
    const documentNo = dto.documentNo.toUpperCase();
    this.logger.info(`Creating vehicle document: ${documentNo}`);

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
        },
        include: {
          vehicle: true,
          documentType: true,
        },
      });

      this.logger.info(`Vehicle document created: ${created.id}`);
      return mapVehicleDocumentToResponse(created);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        handlePrismaError(error, 'Vehicle document');
      }
      throw error; // Re-throw NestJS exceptions
    }
  }

  // -----------------------
  // FIND ALL
  // -----------------------
  async findAll(
    query: QueryWithBusinessDto,
  ): Promise<PaginatedVehicleDocumentResponseDto> {
    this.logger.info(
      `Fetching vehicle documents (skip=${query.skip ?? 0}, take=${query.take ?? 20}, search=${query.search ?? ''})`,
    );

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

      // -------------------------------------------
      // 1) Parse business filters
      // -------------------------------------------
      const parsedBusinessFilters = parseBusinessFilters(
        query.businessFilters,
        LINKAGE_ALLOWED_BUSINESS_FILTERS,
      );

      // 2) Create engine for vehicle documents
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

      this.logger.info(`Fetched ${docs.length} of ${total} vehicle documents`);

      // ---------------------------------------------------------------------
      // 3) Map → Business filters → Return
      // ---------------------------------------------------------------------
      const dtoList = docs.map(mapVehicleDocumentToResponse);

      // Apply business filter resolvers (e.g., status with withinDays)
      const finalList = engine.apply(dtoList, parsedBusinessFilters);

      return {
        items: finalList,
        total: finalList.length,
      };
    } catch (error) {
      // Only handle Prisma errors, let NestJS exceptions pass through
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        handlePrismaError(error, 'Vehicle document');
      }
      throw error; // Re-throw NestJS exceptions
    }
  }

  // -----------------------
  // FIND ONE
  // -----------------------
  async findOne(id: string): Promise<VehicleDocumentResponseDto> {
    this.logger.info(`Fetching vehicle document by id: ${id}`);
    try {
      const doc = await this.prisma.vehicleDocument.findUnique({
        where: { id },
        include: { vehicle: true, documentType: true },
      });
      if (!doc) {
        throw new NotFoundException(`VehicleDocument with id ${id} not found`);
      }
      return mapVehicleDocumentToResponse(doc);
    } catch (error) {
      // Only handle Prisma errors, let NestJS exceptions pass through
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        handlePrismaError(error, 'Vehicle document');
      }
      throw error; // Re-throw NestJS exceptions
    }
  }

  // -----------------------
  // UPDATE
  // -----------------------
  async update(
    id: string,
    dto: UpdateVehicleDocumentDto,
  ): Promise<VehicleDocumentResponseDto> {
    this.logger.info(`Updating vehicle document: ${id}`);
    try {
      const { start, expiry } = await this.validationService.validateUpdate(
        id,
        dto.documentNo,
        dto.vehicleId,
        dto.documentTypeId,
        dto.startDate ? new Date(dto.startDate) : undefined,
        dto.expiryDate ? new Date(dto.expiryDate) : undefined,
      );

      const updated = await this.prisma.vehicleDocument.update({
        where: { id },
        data: {
          documentNo: dto.documentNo?.toUpperCase() ?? undefined,
          startDate: start,
          expiryDate: expiry,
          link: dto.link ?? undefined,
          notes: dto.notes ?? undefined,
          vehicleId: dto.vehicleId ?? undefined,
          documentTypeId: dto.documentTypeId ?? undefined,
        },
        include: { vehicle: true, documentType: true },
      });

      this.logger.info(`Vehicle document updated: ${updated.id}`);
      return mapVehicleDocumentToResponse(updated);
    } catch (error) {
      // Only handle Prisma errors, let NestJS exceptions pass through
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        handlePrismaError(error, 'Vehicle document');
      }
      throw error; // Re-throw NestJS exceptions
    }
  }

  // -----------------------
  // REMOVE
  // -----------------------
  async remove(id: string): Promise<{ success: boolean }> {
    this.logger.info(`Deleting vehicle document: ${id}`);
    try {
      const doc = await this.prisma.vehicleDocument.findUnique({
        where: { id },
      });
      if (!doc) {
        throw new NotFoundException(`VehicleDocument with id ${id} not found`);
      }

      await this.prisma.vehicleDocument.delete({ where: { id } });
      this.logger.info(`Vehicle document deleted: ${id}`);
      return { success: true };
    } catch (error) {
      // Only handle Prisma errors, let NestJS exceptions pass through
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        handlePrismaError(error, 'Vehicle document');
      }
      throw error; // Re-throw NestJS exceptions
    }
  }
}
