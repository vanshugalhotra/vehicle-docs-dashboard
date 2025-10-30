import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-vehicle-category.dto';
import { UpdateCategoryDto } from './dto/update-vehicle-category.dto';
import { mapCategoryToResponse } from './vehicle-category.mapper';
import { VehicleCategoryResponse } from 'src/common/types';
import { LoggerService } from 'src/common/logger/logger.service';
import { handlePrismaError } from 'src/common/utils/prisma-error-handler';
import { Prisma } from '@prisma/client';
import { QueryOptionsDto } from 'src/common/dto/query-options.dto';
import { PaginatedCategoryResponseDto } from './dto/vehicle-category-response.dto';
import { buildQueryArgs } from 'src/common/utils/query-builder';
import { VehicleCategoryValidationService } from './validation/vehicle-category-validation.service';

@Injectable()
export class VehicleCategoryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly validationService: VehicleCategoryValidationService,
  ) {}

  async create(dto: CreateCategoryDto): Promise<VehicleCategoryResponse> {
    const name = dto.name;
    this.logger.info(`Creating vehicle category: ${name}`);
    try {
      await this.validationService.validateCreate(name);
      const category = await this.prisma.vehicleCategory.create({
        data: { name: name },
      });

      this.logger.info(`Vehicle category created: ${category.id}`);
      return mapCategoryToResponse(category);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        handlePrismaError(error, 'VehicleCategory');
      }
      throw error; // Re-throw NestJS exceptions
    }
  }

  async findAll(query: QueryOptionsDto): Promise<PaginatedCategoryResponseDto> {
    this.logger.debug(
      `Fetching vehicle categories with params: ${JSON.stringify(query, null, 2)}`,
    );

    try {
      const queryArgs = buildQueryArgs<
        VehicleCategoryResponse,
        Prisma.VehicleCategoryWhereInput
      >(query, ['name']);

      const [categories, total] = await Promise.all([
        this.prisma.vehicleCategory.findMany({
          where: queryArgs.where,
          skip: queryArgs.skip,
          take: queryArgs.take,
          include: query.includeRelations ? { types: true } : undefined,
          orderBy: queryArgs.orderBy,
        }),
        this.prisma.vehicleCategory.count({ where: queryArgs.where }),
      ]);

      this.logger.info(`Fetched ${categories.length} of ${total} categories`);

      return {
        items: categories.map(mapCategoryToResponse),
        total,
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        handlePrismaError(error, 'VehicleCategory');
      }
      throw error; // Re-throw NestJS exceptions
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
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        handlePrismaError(error, 'VehicleCategory');
      }
      throw error; // Re-throw NestJS exceptions
    }
  }

  async update(
    id: string,
    dto: UpdateCategoryDto,
  ): Promise<VehicleCategoryResponse> {
    this.logger.info(`Updating vehicle category: ${id}`);
    try {
      const name = dto.name;
      const category = await this.validationService.validateUpdate(id, name);

      const updated = await this.prisma.vehicleCategory.update({
        where: { id },
        data: { name: name ?? category.name },
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

      if (category.vehicles?.length > 0) {
        throw new ConflictException(
          `Cannot delete vehicle type "${category.name}" because vehicles exist for this type`,
        );
      }

      await this.prisma.vehicleCategory.delete({ where: { id } });
      this.logger.info(`Vehicle category deleted: ${id}`);
      return { success: true };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        handlePrismaError(error, 'VehicleCategory');
      }
      throw error; // Re-throw NestJS exceptions
    }
  }
}
