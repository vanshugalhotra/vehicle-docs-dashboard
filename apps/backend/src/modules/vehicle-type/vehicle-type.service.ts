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
import { LoggerService } from 'src/common/logger/logger.service';
import { handlePrismaError } from 'src/common/utils/prisma-error-handler';
import { Prisma } from '@prisma/client';
import { PaginatedTypeResponseDto } from './dto/vehicle-type-response.dto';
import { QueryOptionsDto } from 'src/common/dto/query-options.dto';
import { buildQueryArgs } from 'src/common/utils/query-builder';
import { VehicleTypeValidationService } from './validation/vehicle-type-validation.service';

@Injectable()
export class VehicleTypeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly validationService: VehicleTypeValidationService,
  ) {}

  async create(dto: CreateVehicleTypeDto): Promise<VehicleTypeResponse> {
    const name = dto.name;
    this.logger.info(
      `Creating vehicle type "${name}" under category "${dto.categoryId}"`,
    );
    try {
      await this.validationService.validateCreate(name, dto.categoryId);
      const type = await this.prisma.vehicleType.create({
        data: { name: name, categoryId: dto.categoryId },
        include: { category: true },
      });

      this.logger.info(`Vehicle type created: ${type.id}`);
      return mapTypeToResponse(type);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        handlePrismaError(error, 'Vehicle type');
      }
      throw error; // Re-throw NestJS exceptions
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
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        handlePrismaError(error, 'Vehicle type');
      }
      throw error; // Re-throw NestJS exceptions
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
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        handlePrismaError(error, 'Vehicle type');
      }
      throw error; // Re-throw NestJS exceptions
    }
  }

  async update(
    id: string,
    dto: UpdateVehicleTypeDto,
  ): Promise<VehicleTypeResponse> {
    this.logger.info(`Updating vehicle type: ${id}`);
    try {
      const { vehicleType } = await this.validationService.validateUpdate(
        id,
        dto.name,
        dto.categoryId,
      );
      const targetCategoryId = dto.categoryId ?? vehicleType.categoryId;
      const targetName = dto.name ?? vehicleType.name;

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
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        handlePrismaError(error, 'Vehicle type');
      }
      throw error; // Re-throw NestJS exceptions
    }
  }
}
