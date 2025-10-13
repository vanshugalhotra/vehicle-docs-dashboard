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

@Injectable()
export class VehicleTypeService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create new vehicle type under a category
   */
  async create(dto: CreateVehicleTypeDto): Promise<VehicleTypeResponse> {
    // Ensure category exists
    const category = await this.prisma.vehicleCategory.findUnique({
      where: { id: dto.categoryId },
    });
    if (!category)
      throw new NotFoundException(
        `Vehicle category with id "${dto.categoryId}" not found`,
      );

    // Ensure uniqueness per category
    const existing = await this.prisma.vehicleType.findFirst({
      where: {
        name: dto.name,
        categoryId: dto.categoryId,
      },
    });
    if (existing)
      throw new ConflictException(
        `Vehicle type "${dto.name}" already exists under this category`,
      );

    const type = await this.prisma.vehicleType.create({
      data: {
        name: dto.name,
        categoryId: dto.categoryId,
      },
      include: { category: true },
    });

    return mapTypeToResponse(type);
  }

  /**
   * Find all types, optionally filtered by category or search
   */
  async findAll(
    categoryId?: string,
    search?: string,
  ): Promise<VehicleTypeResponse[]> {
    const types = await this.prisma.vehicleType.findMany({
      where: {
        categoryId: categoryId || undefined,
        name: search ? { contains: search, mode: 'insensitive' } : undefined,
      },
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    });

    return types.map(mapTypeToResponse);
  }

  /**
   * Find one by id
   */
  async findOne(id: string): Promise<VehicleTypeResponse> {
    const type = await this.prisma.vehicleType.findUnique({
      where: { id },
      include: { category: true },
    });
    if (!type)
      throw new NotFoundException(`Vehicle type with id "${id}" not found`);

    return mapTypeToResponse(type);
  }

  /**
   * Update vehicle type
   */
  async update(
    id: string,
    dto: UpdateVehicleTypeDto,
  ): Promise<VehicleTypeResponse> {
    const existingType = await this.prisma.vehicleType.findUnique({
      where: { id },
    });
    if (!existingType)
      throw new NotFoundException(`Vehicle type with id "${id}" not found`);

    // If changing name or category, enforce uniqueness constraint
    const targetCategoryId = dto.categoryId ?? existingType.categoryId;
    const targetName = dto.name ?? existingType.name;

    const duplicate = await this.prisma.vehicleType.findFirst({
      where: {
        id: { not: id },
        name: targetName,
        categoryId: targetCategoryId,
      },
    });
    if (duplicate)
      throw new ConflictException(
        `Vehicle type "${targetName}" already exists under this category`,
      );

    const updated = await this.prisma.vehicleType.update({
      where: { id },
      data: {
        name: dto.name ?? existingType.name,
        categoryId: dto.categoryId ?? existingType.categoryId,
      },
      include: { category: true },
    });

    return mapTypeToResponse(updated);
  }

  /**
   * Delete vehicle type
   */
  async remove(id: string): Promise<{ success: boolean }> {
    const type = await this.prisma.vehicleType.findUnique({ where: { id } });
    if (!type)
      throw new NotFoundException(`Vehicle type with id "${id}" not found`);

    await this.prisma.vehicleType.delete({ where: { id } });
    return { success: true };
  }
}
