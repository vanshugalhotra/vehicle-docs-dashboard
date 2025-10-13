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

@Injectable()
export class VehicleCategoryService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new vehicle category
   */
  async create(dto: CreateCategoryDto): Promise<VehicleCategoryResponse> {
    const existing = await this.prisma.vehicleCategory.findUnique({
      where: { name: dto.name },
    });
    if (existing) {
      throw new ConflictException(
        `Vehicle category with name "${dto.name}" already exists`,
      );
    }

    const category = await this.prisma.vehicleCategory.create({
      data: { name: dto.name },
    });

    return mapCategoryToResponse(category);
  }

  /**
   * Get all categories (optionally filtered by name)
   * Used for dropdowns / autocomplete
   */
  async findAll(search?: string): Promise<VehicleCategoryResponse[]> {
    const categories = await this.prisma.vehicleCategory.findMany({
      where: search
        ? {
            name: {
              contains: search,
              mode: 'insensitive',
            },
          }
        : {},
      include: { types: true },
      orderBy: { name: 'asc' },
    });

    return categories.map(mapCategoryToResponse);
  }

  /**
   * Get a single category by ID
   */
  async findOne(id: string): Promise<VehicleCategoryResponse> {
    const category = await this.prisma.vehicleCategory.findUnique({
      where: { id },
      include: { types: true },
    });

    if (!category) {
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
    const category = await this.prisma.vehicleCategory.findUnique({
      where: { id },
    });
    if (!category) {
      throw new NotFoundException(`Vehicle category with id ${id} not found`);
    }

    if (dto.name && dto.name !== category.name) {
      const existing = await this.prisma.vehicleCategory.findUnique({
        where: { name: dto.name },
      });
      if (existing) {
        throw new ConflictException(
          `Vehicle category with name "${dto.name}" already exists`,
        );
      }
    }

    const updated = await this.prisma.vehicleCategory.update({
      where: { id },
      data: { name: dto.name ?? category.name },
    });

    return mapCategoryToResponse(updated);
  }

  /**
   * Delete a category
   */
  async remove(id: string): Promise<{ success: boolean }> {
    const category = await this.prisma.vehicleCategory.findUnique({
      where: { id },
    });
    if (!category) {
      throw new NotFoundException(`Vehicle category with id ${id} not found`);
    }

    await this.prisma.vehicleCategory.delete({ where: { id } });
    return { success: true };
  }
}
