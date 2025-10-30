import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { LoggerService } from 'src/common/logger/logger.service';
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
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly ownerValidation: OwnerValidationService,
  ) {}

  async create(dto: CreateOwnerDto): Promise<OwnerResponse> {
    const name = dto.name;
    this.logger.info(`Creating owner: ${name}`);
    try {
      await this.ownerValidation.validateCreate(name);

      const owner = await this.prisma.owner.create({
        data: { name: name },
      });
      this.logger.info(`Owner created: ${owner.id}`);
      return mapOwnerToResponse(owner);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        handlePrismaError(error, 'Owner');
      }
      throw error; // Re-throw NestJS exceptions
    }
  }

  /**
   * Fetch all owners with pagination, search, sorting, and filters.
   */
  async findAll(query: QueryOptionsDto): Promise<PaginatedOwnerResponseDto> {
    this.logger.debug(
      `Fetching owners with params: ${JSON.stringify(query, null, 2)}`,
    );

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

      this.logger.info(`Fetched ${owners.length} of ${total} owners`);

      return {
        items: owners.map(mapOwnerToResponse),
        total,
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        handlePrismaError(error, 'Owner');
      }
      throw error; // Re-throw NestJS exceptions
    }
  }

  async findOne(id: string): Promise<OwnerResponse> {
    this.logger.info(`Fetching owner by id: ${id}`);
    try {
      const owner = await this.prisma.owner.findUnique({ where: { id } });
      if (!owner) {
        this.logger.warn(`Owner not found: ${id}`);
        throw new NotFoundException(`Owner with id ${id} not found`);
      }
      return mapOwnerToResponse(owner);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        handlePrismaError(error, 'Owner');
      }
      throw error; // Re-throw NestJS exceptions
    }
  }

  async update(id: string, dto: UpdateOwnerDto): Promise<OwnerResponse> {
    this.logger.info(`Updating owner: ${id}`);
    try {
      const owner = await this.ownerValidation.validateUpdate(id, dto.name);

      const updated = await this.prisma.owner.update({
        where: { id },
        data: { name: dto.name ?? owner.name },
      });
      this.logger.info(`Owner updated: ${updated.id}`);
      return mapOwnerToResponse(updated);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        handlePrismaError(error, 'Owner');
      }
      throw error; // Re-throw NestJS exceptions
    }
  }

  async remove(id: string): Promise<{ success: boolean }> {
    this.logger.info(`Deleting owner: ${id}`);
    try {
      const owner = await this.prisma.owner.findUnique({ where: { id } });
      if (!owner) {
        this.logger.warn(`Delete failed, owner not found: ${id}`);
        throw new NotFoundException(`Owner with id ${id} not found`);
      }

      // Prevent deletion if any vehicle is linked
      const linkedVehicles = await this.prisma.vehicle.count({
        where: { ownerId: id },
      });
      if (linkedVehicles > 0) {
        this.logger.warn(
          `Delete failed, owner has ${linkedVehicles} assigned vehicle(s): ${id}`,
        );
        throw new ConflictException(
          `Cannot delete owner "${owner.name}" because ${linkedVehicles} vehicle(s) are assigned`,
        );
      }

      await this.prisma.owner.delete({ where: { id } });
      this.logger.info(`Owner deleted: ${id}`);
      return { success: true };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        handlePrismaError(error, 'Owner');
      }
      throw error; // Re-throw NestJS exceptions
    }
  }
}
