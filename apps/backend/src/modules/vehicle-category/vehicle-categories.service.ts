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

@Injectable()
export class VehicleCategoryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService, // injected logger
  ) {}

  /**
   * Create a new vehicle category
   */
  async create(dto: CreateCategoryDto): Promise<VehicleCategoryResponse> {
    this.logger.info(`Creating vehicle category: ${dto.name}`);

    const existing = await this.prisma.vehicleCategory.findUnique({
      where: { name: dto.name },
    });
    if (existing) {
      this.logger.warn(`Category creation failed, already exists: ${dto.name}`);
      throw new ConflictException(
        `Vehicle category with name "${dto.name}" already exists`,
      );
    }

    const category = await this.prisma.vehicleCategory.create({
      data: { name: dto.name },
    });

    this.logger.info(`Vehicle category created: ${category.id}`);
    return mapCategoryToResponse(category);
  }

  /**
   * Get all categories (optionally filtered by name)
   */
  async findAll(search?: string): Promise<VehicleCategoryResponse[]> {
    this.logger.info(
      `Fetching all vehicle categories${search ? ` with search: ${search}` : ''}`,
    );

    const categories = await this.prisma.vehicleCategory.findMany({
      where: search
        ? {
            name: { contains: search, mode: 'insensitive' },
          }
        : {},
      include: { types: true },
      orderBy: { name: 'asc' },
    });

    this.logger.info(`Fetched ${categories.length} categories`);
    return categories.map(mapCategoryToResponse);
  }

  /**
   * Get a single category by ID
   */
  async findOne(id: string): Promise<VehicleCategoryResponse> {
    this.logger.info(`Fetching vehicle category by id: ${id}`);

    const category = await this.prisma.vehicleCategory.findUnique({
      where: { id },
      include: { types: true },
    });

    if (!category) {
      this.logger.warn(`Vehicle category not found: ${id}`);
      throw new NotFoundException(`Vehicle category with id ${id} not found`);
    }

    return mapCategoryToResponse(category);
  }

  /**
   * Update a category
   */
  async update(
    id: string,
    dto: UpdateCategoryDto,
  ): Promise<VehicleCategoryResponse> {
    this.logger.info(`Updating vehicle category: ${id}`);

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
        this.logger.warn(`Update failed, duplicate category name: ${dto.name}`);
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
  }

  /**
   * Delete a category
   */
  async remove(id: string): Promise<{ success: boolean }> {
    this.logger.info(`Deleting vehicle category: ${id}`);

    const category = await this.prisma.vehicleCategory.findUnique({
      where: { id },
    });
    if (!category) {
      this.logger.warn(`Delete failed, category not found: ${id}`);
      throw new NotFoundException(`Vehicle category with id ${id} not found`);
    }

    await this.prisma.vehicleCategory.delete({ where: { id } });
    this.logger.info(`Vehicle category deleted: ${id}`);
    return { success: true };
  }
}
