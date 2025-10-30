import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { mapVehicleToResponse } from './vehicle.mapper';
import { LoggerService } from 'src/common/logger/logger.service';
import { VehicleResponse } from 'src/common/types';
import { Prisma } from '@prisma/client';
import { handlePrismaError } from 'src/common/utils/prisma-error-handler';
import { PaginatedVehicleResponseDto } from './dto/vehicle-response.dto';
import { buildQueryArgs } from 'src/common/utils/query-builder';
import { QueryOptionsDto } from 'src/common/dto/query-options.dto';
import { VehicleValidationService } from './validation/vehicle-validation.service';

@Injectable()
export class VehicleService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly vehicleValidation: VehicleValidationService,
  ) {}

  /**
   * Create a new vehicle
   */
  async create(dto: CreateVehicleDto): Promise<VehicleResponse> {
    try {
      // Normalize input (uppercase for consistency)
      const normalized = {
        licensePlate: dto.licensePlate.toUpperCase(),
        rcNumber: dto.rcNumber.toUpperCase(),
        chassisNumber: dto.chassisNumber.toUpperCase(),
        engineNumber: dto.engineNumber.toUpperCase(),
      };

      await this.vehicleValidation.validateCreate(
        normalized.licensePlate,
        normalized.rcNumber,
        normalized.chassisNumber,
        normalized.engineNumber,
        dto.categoryId,
        dto.typeId,
      );

      // Fetch category and type names for generating the vehicle name
      const category = await this.prisma.vehicleCategory.findUnique({
        where: { id: dto.categoryId },
      });
      const type = await this.prisma.vehicleType.findUnique({
        where: { id: dto.typeId },
      });

      // Generate name: "Category (Type) - LicensePlate"
      const vehicleName = `${category!.name} (${type!.name}) - ${normalized.licensePlate}`;

      const vehicle = await this.prisma.vehicle.create({
        data: {
          name: vehicleName,
          licensePlate: normalized.licensePlate,
          rcNumber: normalized.rcNumber,
          chassisNumber: normalized.chassisNumber,
          engineNumber: normalized.engineNumber,
          notes: dto.notes ?? null,
          categoryId: dto.categoryId,
          typeId: dto.typeId,
          ownerId: dto.ownerId ?? null,
          driverId: dto.driverId ?? null,
          locationId: dto.locationId ?? null,
        },
      });

      this.logger.info(`Created vehicle ${vehicle.id} - ${vehicle.name}`);
      return mapVehicleToResponse(vehicle);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        handlePrismaError(error, 'Vehicle');
      }
      throw error; // Re-throw NestJS exceptions
    }
  }

  /**
   * Retrieve a paginated, searchable, and filterable list of vehicles.
   * Supports full-text search, relation includes, and dynamic filters.
   */
  async findAll(query: QueryOptionsDto): Promise<PaginatedVehicleResponseDto> {
    const { skip, take, where, orderBy } =
      buildQueryArgs<Prisma.VehicleWhereInput>(
        query,
        ['licensePlate', 'name', 'rcNumber', 'chassisNumber', 'engineNumber'], // handled automatically
      );

    const include = query.includeRelations
      ? {
          category: true,
          type: true,
          owner: true,
          driver: true,
          location: true,
        }
      : undefined;

    const search = query.search;

    this.logger.info(
      `Fetching vehicles: skip=${skip}, take=${take}, search="${search ?? ''}", includeRelations=${query.includeRelations}`,
    );

    try {
      // Extend where with relational searches only (avoid duplication)
      const extendedWhere: Prisma.VehicleWhereInput = {
        ...where,
        ...(search && {
          OR: [
            ...(Array.isArray(where?.OR)
              ? (where.OR as Prisma.VehicleWhereInput[])
              : []), // preserve base OR from buildQueryArgs
            { category: { name: { contains: search, mode: 'insensitive' } } },
            { type: { name: { contains: search, mode: 'insensitive' } } },
            { owner: { name: { contains: search, mode: 'insensitive' } } },
            { driver: { name: { contains: search, mode: 'insensitive' } } },
          ],
        }),
      };

      const [vehicles, total] = await Promise.all([
        this.prisma.vehicle.findMany({
          where: extendedWhere,
          include,
          skip,
          take,
          orderBy,
        }),
        this.prisma.vehicle.count({ where: extendedWhere }),
      ]);

      this.logger.info(
        `Fetched ${vehicles.length} of ${total} vehicles successfully.`,
      );

      return {
        items: vehicles.map(mapVehicleToResponse),
        total,
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        handlePrismaError(error, 'Vehicle');
      }
      throw error; // Re-throw NestJS exceptions
    }
  }

  /**
   * Get a single vehicle by ID
   */
  async findOne(id: string): Promise<VehicleResponse> {
    try {
      const vehicle = await this.prisma.vehicle.findUnique({
        where: { id },
        include: {
          category: true,
          type: true,
          owner: true,
          driver: true,
          location: true,
          documents: true,
        },
      });

      if (!vehicle)
        throw new NotFoundException(`Vehicle with id ${id} not found`);
      return mapVehicleToResponse(vehicle);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        handlePrismaError(error, 'Vehicle');
      }
      throw error; // Re-throw NestJS exceptions
    }
  }

  /**
   * Update a vehicle
   */
  async update(id: string, dto: UpdateVehicleDto): Promise<VehicleResponse> {
    try {
      // Normalize input if provided
      const normalized = {
        licensePlate: dto.licensePlate?.toUpperCase(),
        rcNumber: dto.rcNumber?.toUpperCase(),
        chassisNumber: dto.chassisNumber?.toUpperCase(),
        engineNumber: dto.engineNumber?.toUpperCase(),
      };

      // Use validation service
      const { vehicle, category, type } =
        await this.vehicleValidation.validateUpdate(
          id,
          normalized.licensePlate,
          normalized.rcNumber,
          normalized.chassisNumber,
          normalized.engineNumber,
          dto.categoryId,
          dto.typeId,
        );

      // If categoryId, typeId, or licensePlate is updated, regenerate name
      const updatedData: Partial<UpdateVehicleDto & { name?: string }> = {
        ...dto,
      };

      // Add normalized fields if provided
      if (normalized.licensePlate)
        updatedData.licensePlate = normalized.licensePlate;
      if (normalized.rcNumber) updatedData.rcNumber = normalized.rcNumber;
      if (normalized.chassisNumber)
        updatedData.chassisNumber = normalized.chassisNumber;
      if (normalized.engineNumber)
        updatedData.engineNumber = normalized.engineNumber;

      // Regenerate name if category, type, or license plate changed (business logic)
      if (dto.categoryId || dto.typeId || dto.licensePlate) {
        const finalLicensePlate =
          normalized.licensePlate ?? vehicle.licensePlate;

        // Use already fetched category/type or fetch if not available
        const finalCategory =
          category ||
          (await this.prisma.vehicleCategory.findUnique({
            where: { id: dto.categoryId ?? vehicle.categoryId },
          }));
        const finalType =
          type ||
          (await this.prisma.vehicleType.findUnique({
            where: { id: dto.typeId ?? vehicle.typeId },
          }));

        updatedData.name = `${finalCategory!.name} (${finalType!.name}) - ${finalLicensePlate}`;
      }
      const updated = await this.prisma.vehicle.update({
        where: { id },
        data: updatedData,
      });

      this.logger.info(`Updated vehicle ${updated.id} - ${updated.name}`);

      return mapVehicleToResponse(updated);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        handlePrismaError(error, 'Vehicle');
      }
      throw error; // Re-throw NestJS exceptions
    }
  }

  /**
   * Delete a vehicle
   */
  async remove(id: string): Promise<{ success: boolean }> {
    try {
      const vehicle = await this.prisma.vehicle.findUnique({ where: { id } });
      if (!vehicle)
        throw new NotFoundException(`Vehicle with id ${id} not found`);

      await this.prisma.vehicle.delete({ where: { id } });
      this.logger.info(`Deleted vehicle ${vehicle.id} - ${vehicle.name}`);
      return { success: true };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        handlePrismaError(error, 'Vehicle');
      }
      throw error; // Re-throw NestJS exceptions
    }
  }
}
