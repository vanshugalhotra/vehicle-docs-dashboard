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
import { LoggerService, LogContext } from 'src/common/logger/logger.service';
import { handlePrismaError } from 'src/common/utils/prisma-error-handler';
import { Prisma } from '@prisma/client';
import { QueryOptionsDto } from 'src/common/dto/query-options.dto';
import { PaginatedCategoryResponseDto } from './dto/vehicle-category-response.dto';
import { buildQueryArgs } from 'src/common/utils/query-builder';
import { VehicleCategoryValidationService } from './validation/vehicle-category-validation.service';
import { generateVehicleName } from 'src/common/utils/vehicleUtils';

@Injectable()
export class VehicleCategoryService {
  private readonly entity = 'VehicleCategory';

  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly validationService: VehicleCategoryValidationService,
  ) {}

  async create(dto: CreateCategoryDto): Promise<VehicleCategoryResponse> {
    const ctx: LogContext = {
      entity: this.entity,
      action: 'create',
      additional: { dto },
    };
    this.logger.logInfo('Creating vehicle category', ctx);

    try {
      await this.validationService.validateCreate(dto.name);

      const category = await this.prisma.vehicleCategory.create({
        data: { name: dto.name },
      });

      this.logger.logInfo('Vehicle category created', {
        ...ctx,
        additional: { id: category.id },
      });
      return mapCategoryToResponse(category);
    } catch (error) {
      this.logger.logError('Failed to create vehicle category', {
        ...ctx,
        additional: { error },
      });
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        handlePrismaError(error, this.entity);
      }
      throw error;
    }
  }

  async findAll(query: QueryOptionsDto): Promise<PaginatedCategoryResponseDto> {
    const ctx: LogContext = {
      entity: this.entity,
      action: 'fetch',
      additional: { query },
    };
    this.logger.logDebug('Fetching vehicle categories', ctx);

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

      this.logger.logInfo('Fetched vehicle categories', {
        ...ctx,
        additional: { fetched: categories.length, total },
      });

      return { items: categories.map(mapCategoryToResponse), total };
    } catch (error) {
      this.logger.logError('Failed to fetch vehicle categories', {
        ...ctx,
        additional: { error },
      });
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        handlePrismaError(error, this.entity);
      }
      throw error;
    }
  }

  async findOne(id: string): Promise<VehicleCategoryResponse> {
    const ctx: LogContext = {
      entity: this.entity,
      action: 'fetch',
      additional: { id },
    };
    this.logger.logInfo('Fetching vehicle category by id', ctx);

    try {
      const category = await this.prisma.vehicleCategory.findUnique({
        where: { id },
        include: { types: true },
      });

      if (!category) {
        this.logger.logWarn('Vehicle category not found', ctx);
        throw new NotFoundException(`Vehicle category with id ${id} not found`);
      }

      return mapCategoryToResponse(category);
    } catch (error) {
      this.logger.logError('Failed to fetch vehicle category', {
        ...ctx,
        additional: { error },
      });
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        handlePrismaError(error, this.entity);
      }
      throw error;
    }
  }

  async update(
    id: string,
    dto: UpdateCategoryDto,
  ): Promise<VehicleCategoryResponse> {
    const ctx: LogContext = {
      entity: this.entity,
      action: 'update',
      additional: { id, dto },
    };
    this.logger.logInfo('Updating vehicle category', ctx);

    try {
      const category = await this.validationService.validateUpdate(
        id,
        dto.name,
      );

      const updatedCategory = await this.prisma.vehicleCategory.update({
        where: { id },
        data: { name: dto.name ?? category.name },
      });

      this.logger.logInfo('Vehicle category updated', {
        ...ctx,
        additional: { updatedId: updatedCategory.id },
      });

      // Regenerate vehicle names for all vehicles in this category
      const vehicles = await this.prisma.vehicle.findMany({
        where: { categoryId: updatedCategory.id },
        include: { type: true },
      });

      await Promise.all(
        vehicles.map(async (v) => {
          try {
            const newName = generateVehicleName(
              updatedCategory.name,
              v.type.name,
              v.licensePlate,
            );
            await this.prisma.vehicle.update({
              where: { id: v.id },
              data: { name: newName },
            });
          } catch (err) {
            this.logger.logError(`Failed to update vehicle ${v.id}`, {
              ...ctx,
              additional: { error: err },
            });
          }
        }),
      );

      return mapCategoryToResponse(updatedCategory);
    } catch (error) {
      this.logger.logError('Failed to update vehicle category', {
        ...ctx,
        additional: { error },
      });
      handlePrismaError(error, this.entity);
      throw error;
    }
  }

  async remove(id: string): Promise<{ success: boolean }> {
    const ctx: LogContext = {
      entity: this.entity,
      action: 'delete',
      additional: { id },
    };
    this.logger.logInfo('Deleting vehicle category', ctx);

    try {
      const category = await this.prisma.vehicleCategory.findUnique({
        where: { id },
        include: { types: true, vehicles: true },
      });

      if (!category) {
        this.logger.logWarn('Delete failed, category not found', ctx);
        throw new NotFoundException(`Vehicle category with id ${id} not found`);
      }

      if (category.types.length > 0) {
        this.logger.logWarn('Delete failed, category has dependent types', {
          ...ctx,
          additional: { dependentTypes: category.types.length },
        });
        throw new ConflictException(
          `Cannot delete category "${category.name}" because it has ${category.types.length} type(s)`,
        );
      }

      if (category.vehicles?.length > 0) {
        this.logger.logWarn('Delete failed, category has linked vehicles', {
          ...ctx,
          additional: { linkedVehicles: category.vehicles.length },
        });
        throw new ConflictException(
          `Cannot delete vehicle category "${category.name}" because vehicles exist for this category`,
        );
      }

      await this.prisma.vehicleCategory.delete({ where: { id } });
      this.logger.logInfo('Vehicle category deleted', ctx);
      return { success: true };
    } catch (error) {
      this.logger.logError('Failed to delete vehicle category', {
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
