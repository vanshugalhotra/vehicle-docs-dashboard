import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateVehicleTypeDto } from './dto/create-vehicle-type.dto';
import { UpdateVehicleTypeDto } from './dto/update-vehicle-type.dto';
import { VehicleTypeResponse } from 'src/common/types';
import { mapTypeToResponse } from './vehicle-type.mapper';
import { LoggerService, LogContext } from 'src/common/logger/logger.service';
import { handlePrismaError } from 'src/common/utils/prisma-error-handler';
import { Prisma } from '@prisma/client';
import { PaginatedTypeResponseDto } from './dto/vehicle-type-response.dto';
import { QueryOptionsDto } from 'src/common/dto/query-options.dto';
import { buildQueryArgs } from 'src/common/utils/query-builder';
import { VehicleTypeValidationService } from './validation/vehicle-type-validation.service';
import { generateVehicleName } from 'src/common/utils/vehicleUtils';

@Injectable()
export class VehicleTypeService {
  private readonly entity = 'VehicleType';

  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly validationService: VehicleTypeValidationService,
  ) {}

  async create(dto: CreateVehicleTypeDto): Promise<VehicleTypeResponse> {
    const ctx: LogContext = {
      entity: this.entity,
      action: 'create',
      additional: { dto },
    };
    this.logger.logInfo('Creating vehicle type', ctx);

    try {
      await this.validationService.validateCreate(dto.name, dto.categoryId);

      const type = await this.prisma.vehicleType.create({
        data: { name: dto.name, categoryId: dto.categoryId },
        include: { category: true },
      });

      this.logger.logInfo('Vehicle type created', {
        ...ctx,
        additional: { id: type.id },
      });
      return mapTypeToResponse(type);
    } catch (error) {
      this.logger.logError('Failed to create vehicle type', {
        ...ctx,
        additional: { error },
      });
      if (error instanceof Prisma.PrismaClientKnownRequestError)
        handlePrismaError(error, 'Vehicle type');
      throw error;
    }
  }

  async findAll(query: QueryOptionsDto): Promise<PaginatedTypeResponseDto> {
    const ctx: LogContext = {
      entity: this.entity,
      action: 'findAll',
      additional: { query },
    };
    this.logger.logDebug('Fetching vehicle types', ctx);

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

      this.logger.logInfo(
        `Fetched ${types.length} of ${total} vehicle types`,
        ctx,
      );

      return {
        items: types.map(mapTypeToResponse),
        total,
      };
    } catch (error) {
      this.logger.logError('Failed to fetch vehicle types', {
        ...ctx,
        additional: { error },
      });
      if (error instanceof Prisma.PrismaClientKnownRequestError)
        handlePrismaError(error, 'Vehicle type');
      throw error;
    }
  }

  async findOne(id: string): Promise<VehicleTypeResponse> {
    const ctx: LogContext = {
      entity: this.entity,
      action: 'findOne',
      additional: { id },
    };
    this.logger.logInfo('Fetching vehicle type by id', ctx);

    try {
      const type = await this.prisma.vehicleType.findUnique({
        where: { id },
        include: { category: true },
      });

      if (!type) {
        this.logger.logWarn('Vehicle type not found', ctx);
        throw new NotFoundException(`Vehicle type with id "${id}" not found`);
      }

      return mapTypeToResponse(type);
    } catch (error) {
      this.logger.logError('Failed to fetch vehicle type', {
        ...ctx,
        additional: { error },
      });
      if (error instanceof Prisma.PrismaClientKnownRequestError)
        handlePrismaError(error, 'Vehicle type');
      throw error;
    }
  }

  async update(
    id: string,
    dto: UpdateVehicleTypeDto,
  ): Promise<VehicleTypeResponse> {
    const ctx: LogContext = {
      entity: this.entity,
      action: 'update',
      additional: { id, dto },
    };
    this.logger.logInfo('Updating vehicle type', ctx);

    try {
      const { vehicleType } = await this.validationService.validateUpdate(
        id,
        dto.name,
        dto.categoryId,
      );

      const targetCategoryId = dto.categoryId ?? vehicleType.categoryId;
      const targetName = dto.name ?? vehicleType.name;

      const updatedType = await this.prisma.vehicleType.update({
        where: { id },
        data: { name: targetName, categoryId: targetCategoryId },
        include: { category: true },
      });

      this.logger.logInfo('Vehicle type updated', {
        ...ctx,
        additional: { id: updatedType.id },
      });

      // Regenerate vehicle names
      const vehicles = await this.prisma.vehicle.findMany({
        where: { typeId: updatedType.id },
        include: { category: true },
      });

      await Promise.all(
        vehicles.map(async (v) => {
          try {
            const newName = generateVehicleName(
              v.category.name,
              updatedType.name,
              v.licensePlate,
            );
            return await this.prisma.vehicle.update({
              where: { id: v.id },
              data: { name: newName },
            });
          } catch (err) {
            this.logger.logError(`Failed to update vehicle ${v.id}`, {
              ...ctx,
              additional: { error: (err as Error).message },
            });
            return null;
          }
        }),
      );

      return mapTypeToResponse(updatedType);
    } catch (error) {
      this.logger.logError('Failed to update vehicle type', {
        ...ctx,
        additional: { error },
      });
      if (error instanceof Prisma.PrismaClientKnownRequestError)
        handlePrismaError(error, 'Vehicle type');
      throw error;
    }
  }

  async remove(id: string): Promise<{ success: boolean }> {
    const ctx: LogContext = {
      entity: this.entity,
      action: 'remove',
      additional: { id },
    };
    this.logger.logInfo('Deleting vehicle type', ctx);

    try {
      const type = await this.prisma.vehicleType.findUnique({
        where: { id },
        include: { vehicles: true },
      });

      if (!type) {
        this.logger.logWarn('Vehicle type not found', ctx);
        throw new NotFoundException(`Vehicle type with id "${id}" not found`);
      }

      if (type.vehicles?.length > 0) {
        this.logger.logWarn('Cannot delete vehicle type, vehicles exist', ctx);
        throw new ConflictException(
          `Cannot delete vehicle type "${type.name}" because vehicles exist for this type`,
        );
      }

      await this.prisma.vehicleType.delete({ where: { id } });
      this.logger.logInfo('Vehicle type deleted', ctx);

      return { success: true };
    } catch (error) {
      this.logger.logError('Failed to delete vehicle type', {
        ...ctx,
        additional: { error },
      });
      if (error instanceof Prisma.PrismaClientKnownRequestError)
        handlePrismaError(error, 'Vehicle type');
      throw error;
    }
  }
}
