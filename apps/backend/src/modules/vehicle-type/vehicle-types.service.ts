import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateVehicleTypeDto } from './dto/create-type.dto';
import { UpdateVehicleTypeDto } from './dto/update-type.dto';
import { VehicleTypeResponse } from 'src/common/types';
import { mapTypeToResponse } from './vehicle-types.mapper';
import { LoggerService } from 'src/common/logger/logger.service';
import { handlePrismaError } from 'src/common/utils/prisma-error-handler';
import { Prisma } from '@prisma/client';
import { PaginatedTypeResponseDto } from './dto/type-response.dto';
import { QueryOptionsDto } from 'src/common/dto/query-options.dto';
import { buildQueryArgs } from 'src/common/utils/query-builder';

@Injectable()
export class VehicleTypeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
  ) {}

  async create(dto: CreateVehicleTypeDto): Promise<VehicleTypeResponse> {
    const name = dto.name.trim();
    this.logger.info(
      `Creating vehicle type "${name}" under category "${dto.categoryId}"`,
    );
    try {
      const category = await this.prisma.vehicleCategory.findUnique({
        where: { id: dto.categoryId },
      });
      if (!category) {
        this.logger.warn(`Category not found: ${dto.categoryId}`);
        throw new NotFoundException(
          `Vehicle category with id "${dto.categoryId}" not found`,
        );
      }

      const existing = await this.prisma.vehicleType.findFirst({
        where: {
          name: {
            equals: name,
            mode: 'insensitive',
          },
          categoryId: dto.categoryId,
        },
      });
      if (existing) {
        this.logger.warn(
          `Vehicle type already exists: ${name} in category ${dto.categoryId}`,
        );
        throw new ConflictException(
          `Vehicle type "${name}" already exists under this category`,
        );
      }

      const type = await this.prisma.vehicleType.create({
        data: { name: name, categoryId: dto.categoryId },
        include: { category: true },
      });

      this.logger.info(`Vehicle type created: ${type.id}`);
      return mapTypeToResponse(type);
    } catch (error) {
      handlePrismaError(error, 'Vehicle type');
    }
  }

  async findAll(query: QueryOptionsDto): Promise<PaginatedTypeResponseDto> {
    this.logger.debug(
      `Fetching vehicle types with params: ${JSON.stringify(query, null, 2)}`,
    );

    try {
      const queryArgs = buildQueryArgs<
        VehicleTypeResponse,
        Prisma.VehicleTypeWhereInput
      >(query, ['name']);

      const [types, total] = await Promise.all([
        this.prisma.vehicleType.findMany({
          where: queryArgs.where,
          skip: queryArgs.skip,
          take: queryArgs.take,
          include: { category: true },
          orderBy: queryArgs.orderBy,
        }),
        this.prisma.vehicleType.count({ where: queryArgs.where }),
      ]);

      this.logger.info(`Fetched ${types.length} of ${total} vehicle types`);

      return {
        items: types.map(mapTypeToResponse),
        total,
      };
    } catch (error) {
      handlePrismaError(error, 'Vehicle type');
    }
  }
  async findOne(id: string): Promise<VehicleTypeResponse> {
    this.logger.info(`Fetching vehicle type by id: ${id}`);
    try {
      const type = await this.prisma.vehicleType.findUnique({
        where: { id },
        include: { category: true },
      });
      if (!type) {
        this.logger.warn(`Vehicle type not found: ${id}`);
        throw new NotFoundException(`Vehicle type with id "${id}" not found`);
      }
      return mapTypeToResponse(type);
    } catch (error) {
      handlePrismaError(error, 'Vehicle type');
    }
  }

  async update(
    id: string,
    dto: UpdateVehicleTypeDto,
  ): Promise<VehicleTypeResponse> {
    this.logger.info(`Updating vehicle type: ${id}`);
    try {
      const existingType = await this.prisma.vehicleType.findUnique({
        where: { id },
      });
      if (!existingType) {
        this.logger.warn(`Vehicle type not found: ${id}`);
        throw new NotFoundException(`Vehicle type with id "${id}" not found`);
      }

      const targetCategoryId = dto.categoryId ?? existingType.categoryId;
      const targetName = dto.name ?? existingType.name;

      const duplicate = await this.prisma.vehicleType.findFirst({
        where: {
          id: { not: id },
          name: targetName,
          categoryId: targetCategoryId,
        },
      });
      if (duplicate) {
        this.logger.warn(
          `Duplicate vehicle type: ${targetName} in category ${targetCategoryId}`,
        );
        throw new ConflictException(
          `Vehicle type "${targetName}" already exists under this category`,
        );
      }

      const updated = await this.prisma.vehicleType.update({
        where: { id },
        data: { name: targetName, categoryId: targetCategoryId },
        include: { category: true },
      });

      this.logger.info(`Vehicle type updated: ${updated.id}`);
      return mapTypeToResponse(updated);
    } catch (error) {
      handlePrismaError(error, 'Vehicle type');
    }
  }

  async remove(id: string): Promise<{ success: boolean }> {
    this.logger.info(`Deleting vehicle type: ${id}`);
    try {
      const type = await this.prisma.vehicleType.findUnique({
        where: { id },
        include: { vehicles: true },
      });
      if (!type) {
        this.logger.warn(`Vehicle type not found: ${id}`);
        throw new NotFoundException(`Vehicle type with id "${id}" not found`);
      }
      if (type.vehicles?.length > 0) {
        throw new ConflictException(
          `Cannot delete vehicle type "${type.name}" because vehicles exist for this type`,
        );
      }
      await this.prisma.vehicleType.delete({ where: { id } });
      this.logger.info(`Vehicle type deleted: ${id}`);
      return { success: true };
    } catch (error) {
      handlePrismaError(error, 'Vehicle type');
    }
  }
}
