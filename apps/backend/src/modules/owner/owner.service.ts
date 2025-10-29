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

@Injectable()
export class OwnerService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
  ) {}

  async create(dto: CreateOwnerDto): Promise<OwnerResponse> {
    const name = dto.name.trim();
    this.logger.info(`Creating owner: ${name}`);
    try {
      const existing = await this.prisma.owner.findFirst({
        where: { name: { equals: name, mode: 'insensitive' } },
      });
      if (existing) {
        this.logger.warn(`Owner creation failed, already exists: ${name}`);
        throw new ConflictException(`Owner with name "${name}" already exists`);
      }

      const owner = await this.prisma.owner.create({
        data: { name: name },
      });
      this.logger.info(`Owner created: ${owner.id}`);
      return mapOwnerToResponse(owner);
    } catch (error) {
      handlePrismaError(error, 'Owner');
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
      handlePrismaError(error, 'Owner');
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
      handlePrismaError(error, 'Owner');
    }
  }

  async update(id: string, dto: UpdateOwnerDto): Promise<OwnerResponse> {
    this.logger.info(`Updating owner: ${id}`);
    try {
      const owner = await this.prisma.owner.findUnique({ where: { id } });
      if (!owner) {
        this.logger.warn(`Update failed, owner not found: ${id}`);
        throw new NotFoundException(`Owner with id ${id} not found`);
      }
      const name = dto.name?.trim();
      if (name && name !== owner.name) {
        const existing = await this.prisma.owner.findFirst({
          where: { name: { equals: name, mode: 'insensitive' } },
        });
        if (existing) {
          this.logger.warn(`Update failed, duplicate owner name: ${name}`);
          throw new ConflictException(
            `Owner with name "${name}" already exists`,
          );
        }
      }

      const updated = await this.prisma.owner.update({
        where: { id },
        data: { name: name ?? owner.name },
      });
      this.logger.info(`Owner updated: ${updated.id}`);
      return mapOwnerToResponse(updated);
    } catch (error) {
      handlePrismaError(error, 'Owner');
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
      handlePrismaError(error, 'Owner');
    }
  }
}
