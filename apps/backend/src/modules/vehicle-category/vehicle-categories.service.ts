import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { mapCategoryToResponse } from './vehicle-categories.mapper';
import { VehicleCategoryResponse } from 'src/common/types';
import { LoggerService } from 'src/common/logger/logger.service';
import { handlePrismaError } from 'src/common/utils/prisma-error-handler';

@Injectable()
export class VehicleCategoryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
  ) {}

  async create(dto: CreateCategoryDto): Promise<VehicleCategoryResponse> {
    const name = dto.name.trim();
    this.logger.info(`Creating vehicle category: ${name}`);
    try {
      const existing = await this.prisma.vehicleCategory.findFirst({
        where: {
          name: {
            equals: name,
            mode: 'insensitive',
          },
        },
      });
      if (existing) {
        this.logger.warn(`Category creation failed, already exists: ${name}`);
        throw new ConflictException(
          `Vehicle category with name "${name}" already exists`,
        );
      }

      const category = await this.prisma.vehicleCategory.create({
        data: { name: name },
      });

      this.logger.info(`Vehicle category created: ${category.id}`);
      return mapCategoryToResponse(category);
    } catch (error) {
      handlePrismaError(error, 'Vehicle category');
    }
  }

  async findAll(search?: string): Promise<VehicleCategoryResponse[]> {
    this.logger.info(
      `Fetching all vehicle categories${search ? ` with search: ${search}` : ''}`,
    );
    try {
      const categories = await this.prisma.vehicleCategory.findMany({
        where: search
          ? { name: { contains: search, mode: 'insensitive' } }
          : {},
        include: { types: true },
        orderBy: { name: 'asc' },
      });

      this.logger.info(`Fetched ${categories.length} categories`);
      return categories.map(mapCategoryToResponse);
    } catch (error) {
      handlePrismaError(error, 'Vehicle category');
    }
  }

  async findOne(id: string): Promise<VehicleCategoryResponse> {
    this.logger.info(`Fetching vehicle category by id: ${id}`);
    try {
      const category = await this.prisma.vehicleCategory.findUnique({
        where: { id },
        include: { types: true },
      });
      if (!category) {
        this.logger.warn(`Vehicle category not found: ${id}`);
        throw new NotFoundException(`Vehicle category with id ${id} not found`);
      }
      return mapCategoryToResponse(category);
    } catch (error) {
      handlePrismaError(error, 'Vehicle category');
    }
  }

  async update(
    id: string,
    dto: UpdateCategoryDto,
  ): Promise<VehicleCategoryResponse> {
    this.logger.info(`Updating vehicle category: ${id}`);
    try {
      const category = await this.prisma.vehicleCategory.findUnique({
        where: { id },
      });
      if (!category) {
        this.logger.warn(`Update failed, category not found: ${id}`);
        throw new NotFoundException(`Vehicle category with id ${id} not found`);
      }

      if (dto.name && dto.name !== category.name) {
        const existing = await this.prisma.vehicleCategory.findUnique({
          where: { name: dto.name },
        });
        if (existing) {
          this.logger.warn(
            `Update failed, duplicate category name: ${dto.name}`,
          );
          throw new ConflictException(
            `Vehicle category with name "${dto.name}" already exists`,
          );
        }
      }

      const updated = await this.prisma.vehicleCategory.update({
        where: { id },
        data: { name: dto.name ?? category.name },
      });

      this.logger.info(`Vehicle category updated: ${updated.id}`);
      return mapCategoryToResponse(updated);
    } catch (error) {
      handlePrismaError(error, 'Vehicle category');
    }
  }

  async remove(id: string): Promise<{ success: boolean }> {
    this.logger.info(`Deleting vehicle category: ${id}`);
    try {
      const category = await this.prisma.vehicleCategory.findUnique({
        where: { id },
        include: { types: true, vehicles: true },
      });
      if (!category) {
        this.logger.warn(`Delete failed, category not found: ${id}`);
        throw new NotFoundException(`Vehicle category with id ${id} not found`);
      }

      if (category.types.length > 0) {
        this.logger.warn(`Delete failed, category has dependent types: ${id}`);
        throw new ConflictException(
          `Cannot delete category "${category.name}" because it has ${category.types.length} type(s)`,
        );
      }

      if (category.vehicles.length > 0) {
        throw new ConflictException(
          `Cannot delete vehicle type "${category.name}" because vehicles exist for this type`,
        );
      }

      await this.prisma.vehicleCategory.delete({ where: { id } });
      this.logger.info(`Vehicle category deleted: ${id}`);
      return { success: true };
    } catch (error) {
      handlePrismaError(error, 'Vehicle category');
    }
  }
}
