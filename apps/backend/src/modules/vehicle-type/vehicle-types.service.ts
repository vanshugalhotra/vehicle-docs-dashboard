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

@Injectable()
export class VehicleTypeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
  ) {}

  async create(dto: CreateVehicleTypeDto): Promise<VehicleTypeResponse> {
    this.logger.info(
      `Creating vehicle type "${dto.name}" under category "${dto.categoryId}"`,
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
        where: { name: dto.name, categoryId: dto.categoryId },
      });
      if (existing) {
        this.logger.warn(
          `Vehicle type already exists: ${dto.name} in category ${dto.categoryId}`,
        );
        throw new ConflictException(
          `Vehicle type "${dto.name}" already exists under this category`,
        );
      }

      const type = await this.prisma.vehicleType.create({
        data: { name: dto.name, categoryId: dto.categoryId },
        include: { category: true },
      });

      this.logger.info(`Vehicle type created: ${type.id}`);
      return mapTypeToResponse(type);
    } catch (error) {
      handlePrismaError(error, 'Vehicle type');
    }
  }

  async findAll(
    categoryId?: string,
    search?: string,
  ): Promise<VehicleTypeResponse[]> {
    this.logger.info(
      `Fetching vehicle types${categoryId ? ` for category: ${categoryId}` : ''}${search ? ` with search: ${search}` : ''}`,
    );
    try {
      const types = await this.prisma.vehicleType.findMany({
        where: {
          categoryId: categoryId || undefined,
          name: search ? { contains: search, mode: 'insensitive' } : undefined,
        },
        include: { category: true },
        orderBy: { createdAt: 'desc' },
      });

      this.logger.info(`Fetched ${types.length} vehicle types`);
      return types.map(mapTypeToResponse);
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
      const type = await this.prisma.vehicleType.findUnique({ where: { id } });
      if (!type) {
        this.logger.warn(`Vehicle type not found: ${id}`);
        throw new NotFoundException(`Vehicle type with id "${id}" not found`);
      }

      await this.prisma.vehicleType.delete({ where: { id } });
      this.logger.info(`Vehicle type deleted: ${id}`);
      return { success: true };
    } catch (error) {
      handlePrismaError(error, 'Vehicle type');
    }
  }
}
