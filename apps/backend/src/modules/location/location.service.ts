import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { LoggerService, LogContext } from 'src/common/logger/logger.service';
import { handlePrismaError } from 'src/common/utils/prisma-error-handler';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { mapLocationToResponse } from './location.mapper';
import { LocationResponse } from 'src/common/types';
import { Prisma } from '@prisma/client';
import { buildQueryArgs } from 'src/common/utils/query-builder';
import { QueryOptionsDto } from 'src/common/dto/query-options.dto';
import { PaginatedLocationResponseDto } from './dto/location-response';
import { LocationValidationService } from './validation/location-validation.service';
import { AuditService } from '../audit/audit.service';
import { AuditEntity, AuditAction } from 'src/common/types/audit.types';

@Injectable()
export class LocationService {
  private readonly entity = 'Location';

  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly validationService: LocationValidationService,
    private readonly auditService: AuditService,
  ) {}

  async create(dto: CreateLocationDto): Promise<LocationResponse> {
    const ctx: LogContext = {
      entity: this.entity,
      action: 'create',
      additional: { dto },
    };
    this.logger.logInfo('Creating location', ctx);

    try {
      await this.validationService.validateCreate(dto.name);

      const location = await this.prisma.location.create({
        data: { name: dto.name },
      });

      this.logger.logInfo(`Location created`, {
        ...ctx,
        additional: { id: location.id },
      });
      // audit
      await this.auditService.record<typeof location>({
        entityType: AuditEntity.LOCATION,
        entityId: location.id,
        action: AuditAction.CREATE,
        actorUserId: null,
        oldRecord: null,
        newRecord: location,
      });
      return mapLocationToResponse(location);
    } catch (error) {
      this.logger.logError('Failed to create location', {
        ...ctx,
        additional: { error },
      });
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        handlePrismaError(error, this.entity);
      }
      throw error;
    }
  }

  async findAll(query: QueryOptionsDto): Promise<PaginatedLocationResponseDto> {
    const ctx: LogContext = {
      entity: this.entity,
      action: 'fetch',
      additional: { query },
    };
    this.logger.logDebug('Fetching locations', ctx);

    try {
      const queryArgs = buildQueryArgs<
        LocationResponse,
        Prisma.LocationWhereInput
      >(query, ['name']);

      const [locations, total] = await Promise.all([
        this.prisma.location.findMany({
          where: queryArgs.where,
          skip: queryArgs.skip,
          take: queryArgs.take,
          orderBy: queryArgs.orderBy,
        }),
        this.prisma.location.count({ where: queryArgs.where }),
      ]);

      this.logger.logInfo(`Fetched locations`, {
        ...ctx,
        additional: { fetched: locations.length, total },
      });

      return {
        items: locations.map(mapLocationToResponse),
        total,
      };
    } catch (error) {
      this.logger.logError('Failed to fetch locations', {
        ...ctx,
        additional: { error },
      });
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        handlePrismaError(error, this.entity);
      }
      throw error;
    }
  }

  async findOne(id: string): Promise<LocationResponse> {
    const ctx: LogContext = {
      entity: this.entity,
      action: 'fetch',
      additional: { id },
    };
    this.logger.logInfo('Fetching location by id', ctx);

    try {
      const location = await this.prisma.location.findUnique({ where: { id } });
      if (!location) {
        this.logger.logWarn('Location not found', ctx);
        throw new NotFoundException(`Location with id ${id} not found`);
      }
      return mapLocationToResponse(location);
    } catch (error) {
      this.logger.logError('Failed to fetch location', {
        ...ctx,
        additional: { error },
      });
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        handlePrismaError(error, this.entity);
      }
      throw error;
    }
  }

  async update(id: string, dto: UpdateLocationDto): Promise<LocationResponse> {
    const ctx: LogContext = {
      entity: this.entity,
      action: 'update',
      additional: { id, dto },
    };
    this.logger.logInfo('Updating location', ctx);

    try {
      const location = await this.validationService.validateUpdate(
        id,
        dto.name,
      );
      const updated = await this.prisma.location.update({
        where: { id },
        data: { name: dto.name ?? location.name },
      });

      this.logger.logInfo('Location updated', {
        ...ctx,
        additional: { updatedId: updated.id },
      });
      // audit
      await this.auditService.record<typeof updated>({
        entityType: AuditEntity.LOCATION,
        entityId: updated.id,
        action: AuditAction.UPDATE,
        actorUserId: null,
        oldRecord: location,
        newRecord: updated,
      });
      return mapLocationToResponse(updated);
    } catch (error) {
      this.logger.logError('Failed to update location', {
        ...ctx,
        additional: { error },
      });
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        handlePrismaError(error, this.entity);
      }
      throw error;
    }
  }

  async remove(id: string): Promise<{ success: boolean }> {
    const ctx: LogContext = {
      entity: this.entity,
      action: 'delete',
      additional: { id },
    };
    this.logger.logInfo('Deleting location', ctx);

    try {
      const location = await this.prisma.location.findUnique({ where: { id } });
      if (!location) {
        this.logger.logWarn('Delete failed, location not found', ctx);
        throw new NotFoundException(`Location with id ${id} not found`);
      }

      const linkedVehicles = await this.prisma.vehicle.count({
        where: { locationId: id },
      });
      if (linkedVehicles > 0) {
        this.logger.logWarn('Delete failed, location has linked vehicles', {
          ...ctx,
          additional: { linkedVehicles },
        });
        throw new ConflictException(
          `Cannot delete location "${location.name}" because ${linkedVehicles} vehicle(s) are assigned`,
        );
      }

      await this.prisma.location.delete({ where: { id } });
      this.logger.logInfo('Location deleted', ctx);
      // audit
      await this.auditService.record<typeof location>({
        entityType: AuditEntity.LOCATION,
        entityId: location.id,
        action: AuditAction.DELETE,
        actorUserId: null,
        oldRecord: location,
        newRecord: null,
      });
      return { success: true };
    } catch (error) {
      this.logger.logError('Failed to delete location', {
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
