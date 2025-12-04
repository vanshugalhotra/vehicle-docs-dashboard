import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { LoggerService, LogContext } from 'src/common/logger/logger.service';
import { handlePrismaError } from 'src/common/utils/prisma-error-handler';
import { CreateOwnerDto } from './dto/create-owner.dto';
import { UpdateOwnerDto } from './dto/update-owner.dto';
import { mapOwnerToResponse } from './owner.mapper';
import { OwnerResponse } from 'src/common/types';
import { Prisma } from '@prisma/client';
import { QueryOptionsDto } from 'src/common/dto/query-options.dto';
import { PaginatedOwnerResponseDto } from './dto/owner-response.dto';
import { buildQueryArgs } from 'src/common/utils/query-builder';
import { OwnerValidationService } from './validation/owner-validation.service';

@Injectable()
export class OwnerService {
  private readonly entity = 'Owner';

  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly ownerValidation: OwnerValidationService,
  ) {}

  async create(dto: CreateOwnerDto): Promise<OwnerResponse> {
    const ctx: LogContext = {
      entity: this.entity,
      action: 'create',
      additional: { dto },
    };
    this.logger.logInfo('Creating owner', ctx);

    try {
      await this.ownerValidation.validateCreate(dto.name);

      const owner = await this.prisma.owner.create({
        data: { name: dto.name },
      });

      this.logger.logInfo('Owner created', {
        ...ctx,
        additional: { id: owner.id },
      });
      return mapOwnerToResponse(owner);
    } catch (error) {
      this.logger.logError('Failed to create owner', {
        ...ctx,
        additional: { error },
      });
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        handlePrismaError(error, this.entity);
      }
      throw error;
    }
  }

  async findAll(query: QueryOptionsDto): Promise<PaginatedOwnerResponseDto> {
    const ctx: LogContext = {
      entity: this.entity,
      action: 'fetch',
      additional: { query },
    };
    this.logger.logDebug('Fetching owners', ctx);

    try {
      const queryArgs = buildQueryArgs<OwnerResponse, Prisma.OwnerWhereInput>(
        query,
        ['name'],
      );

      const [owners, total] = await Promise.all([
        this.prisma.owner.findMany({
          where: queryArgs.where,
          skip: queryArgs.skip,
          take: queryArgs.take,
          orderBy: queryArgs.orderBy,
        }),
        this.prisma.owner.count({ where: queryArgs.where }),
      ]);

      this.logger.logInfo('Fetched owners', {
        ...ctx,
        additional: { fetched: owners.length, total },
      });

      return {
        items: owners.map(mapOwnerToResponse),
        total,
      };
    } catch (error) {
      this.logger.logError('Failed to fetch owners', {
        ...ctx,
        additional: { error },
      });
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        handlePrismaError(error, this.entity);
      }
      throw error;
    }
  }

  async findOne(id: string): Promise<OwnerResponse> {
    const ctx: LogContext = {
      entity: this.entity,
      action: 'fetch',
      additional: { id },
    };
    this.logger.logInfo('Fetching owner by id', ctx);

    try {
      const owner = await this.prisma.owner.findUnique({ where: { id } });
      if (!owner) {
        this.logger.logWarn('Owner not found', ctx);
        throw new NotFoundException(`Owner with id ${id} not found`);
      }
      return mapOwnerToResponse(owner);
    } catch (error) {
      this.logger.logError('Failed to fetch owner', {
        ...ctx,
        additional: { error },
      });
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        handlePrismaError(error, this.entity);
      }
      throw error;
    }
  }

  async update(id: string, dto: UpdateOwnerDto): Promise<OwnerResponse> {
    const ctx: LogContext = {
      entity: this.entity,
      action: 'update',
      additional: { id, dto },
    };
    this.logger.logInfo('Updating owner', ctx);

    try {
      const owner = await this.ownerValidation.validateUpdate(id, dto.name);

      const updated = await this.prisma.owner.update({
        where: { id },
        data: { name: dto.name ?? owner.name },
      });

      this.logger.logInfo('Owner updated', {
        ...ctx,
        additional: { updatedId: updated.id },
      });
      return mapOwnerToResponse(updated);
    } catch (error) {
      this.logger.logError('Failed to update owner', {
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
    this.logger.logInfo('Deleting owner', ctx);

    try {
      const owner = await this.prisma.owner.findUnique({ where: { id } });
      if (!owner) {
        this.logger.logWarn('Delete failed, owner not found', ctx);
        throw new NotFoundException(`Owner with id ${id} not found`);
      }

      const linkedVehicles = await this.prisma.vehicle.count({
        where: { ownerId: id },
      });
      if (linkedVehicles > 0) {
        this.logger.logWarn('Delete failed, owner has linked vehicles', {
          ...ctx,
          additional: { linkedVehicles },
        });
        throw new ConflictException(
          `Cannot delete owner "${owner.name}" because ${linkedVehicles} vehicle(s) are assigned`,
        );
      }

      await this.prisma.owner.delete({ where: { id } });
      this.logger.logInfo('Owner deleted', ctx);
      return { success: true };
    } catch (error) {
      this.logger.logError('Failed to delete owner', {
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
