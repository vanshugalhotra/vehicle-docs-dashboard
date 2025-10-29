import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { mapVehicleToResponse } from './vehicles.mapper';
import { LoggerService } from 'src/common/logger/logger.service';
import { VehicleResponse } from 'src/common/types';
import { Prisma } from '@prisma/client';
import { handlePrismaError } from 'src/common/utils/prisma-error-handler';
import { PaginatedVehicleResponseDto } from './dto/vehicle-response.dto';
import { buildQueryArgs } from 'src/common/utils/query-builder';
import { QueryOptionsDto } from 'src/common/dto/query-options.dto';

@Injectable()
export class VehiclesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
  ) {}

  /**
   * Create a new vehicle
   */
  async create(dto: CreateVehicleDto): Promise<VehicleResponse> {
    // Normalize input (trim + uppercase for consistency)
    const normalized = {
      licensePlate: dto.licensePlate?.trim().toUpperCase(),
      rcNumber: dto.rcNumber?.trim().toUpperCase(),
      chassisNumber: dto.chassisNumber?.trim().toUpperCase(),
      engineNumber: dto.engineNumber?.trim().toUpperCase(),
    };

    const existing = await this.prisma.vehicle.findFirst({
      where: {
        OR: [
          {
            licensePlate: {
              equals: normalized.licensePlate,
              mode: 'insensitive',
            },
          },
          { rcNumber: { equals: normalized.rcNumber, mode: 'insensitive' } },
          {
            chassisNumber: {
              equals: normalized.chassisNumber,
              mode: 'insensitive',
            },
          },
          {
            engineNumber: {
              equals: normalized.engineNumber,
              mode: 'insensitive',
            },
          },
        ],
      },
    });
    if (existing) {
      this.logger.warn('Vehicle with same identifiers already exists');
      throw new ConflictException(
        'Vehicle with same identifiers already exists',
      );
    }

    // Fetch category and type names for generating the vehicle name
    const category = await this.prisma.vehicleCategory.findUnique({
      where: { id: dto.categoryId },
    });
    const type = await this.prisma.vehicleType.findUnique({
      where: { id: dto.typeId },
    });

    if (!category) throw new NotFoundException(`Category not found`);
    if (!type) throw new NotFoundException(`Type not found`);

    if (type.categoryId !== dto.categoryId) {
      throw new ConflictException(
        `Vehicle type "${type.name}" does not belong to category "${category.name}"`,
      );
    }

    // Generate name: "Category (Type) - LicensePlate"
    const vehicleName = `${category.name} (${type.name}) - ${normalized.licensePlate}`;

    const vehicle = await this.prisma.vehicle.create({
      data: {
        name: vehicleName,
        licensePlate: normalized.licensePlate,
        rcNumber: normalized.rcNumber,
        chassisNumber: normalized.chassisNumber,
        engineNumber: normalized.engineNumber,
        notes: dto.notes?.trim() ?? null,
        categoryId: dto.categoryId,
        typeId: dto.typeId,
        ownerId: dto.ownerId ?? null,
        driverId: dto.driverId ?? null,
        locationId: dto.locationId ?? null,
      },
    });

    this.logger.info(`Created vehicle ${vehicle.id} - ${vehicle.name}`);
    return mapVehicleToResponse(vehicle);
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

    const search = query.search?.trim();

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
      this.logger.error('Error fetching vehicles', { error });
      handlePrismaError(error, 'Vehicle');
    }
  }

  /**
   * Get a single vehicle by ID
   */
  async findOne(id: string): Promise<VehicleResponse> {
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
  }

  /**
   * Update a vehicle
   */
  async update(id: string, dto: UpdateVehicleDto): Promise<VehicleResponse> {
    const vehicle = await this.prisma.vehicle.findUnique({ where: { id } });
    if (!vehicle)
      throw new NotFoundException(`Vehicle with id ${id} not found`);

    // Normalize input if provided
    const normalized = {
      licensePlate: dto.licensePlate?.trim().toUpperCase(),
      rcNumber: dto.rcNumber?.trim().toUpperCase(),
      chassisNumber: dto.chassisNumber?.trim().toUpperCase(),
      engineNumber: dto.engineNumber?.trim().toUpperCase(),
    };

    // Check for uniqueness conflicts if any of the fields are being updated
    if (
      dto.licensePlate ||
      dto.rcNumber ||
      dto.chassisNumber ||
      dto.engineNumber
    ) {
      const conflict = await this.prisma.vehicle.findFirst({
        where: {
          AND: { id: { not: id } },
          OR: [
            { licensePlate: normalized.licensePlate },
            { rcNumber: normalized.rcNumber },
            { chassisNumber: normalized.chassisNumber },
            { engineNumber: normalized.engineNumber },
          ],
        },
      });
      if (conflict)
        throw new ConflictException(
          'Another vehicle with same identifiers exists',
        );
    }

    // Validate category-type relationship if either is being updated
    if (dto.categoryId || dto.typeId) {
      const categoryId = dto.categoryId ?? vehicle.categoryId;
      const typeId = dto.typeId ?? vehicle.typeId;

      const type = await this.prisma.vehicleType.findUnique({
        where: { id: typeId },
        include: { category: true },
      });

      if (!type) throw new NotFoundException('Type not found');

      // Check if the type belongs to the category
      if (type.categoryId !== categoryId) {
        const category = await this.prisma.vehicleCategory.findUnique({
          where: { id: categoryId },
        });
        throw new ConflictException(
          `Vehicle type "${type.name}" does not belong to category "${category?.name}"`,
        );
      }
    }

    // If categoryId, typeId, or licensePlate is updated, regenerate name
    const updatedData: Partial<UpdateVehicleDto & { name?: string }> = {
      ...dto,
    };

    if (dto.categoryId || dto.typeId || dto.licensePlate) {
      const category = dto.categoryId
        ? await this.prisma.vehicleCategory.findUnique({
            where: { id: dto.categoryId },
          })
        : await this.prisma.vehicleCategory.findUnique({
            where: { id: vehicle.categoryId },
          });
      const type = dto.typeId
        ? await this.prisma.vehicleType.findUnique({
            where: { id: dto.typeId },
          })
        : await this.prisma.vehicleType.findUnique({
            where: { id: vehicle.typeId },
          });

      if (!category) throw new NotFoundException('Category not found');
      if (!type) throw new NotFoundException('Type not found');

      const license = normalized.licensePlate ?? vehicle.licensePlate;
      updatedData.name = `${category.name} (${type.name}) - ${license}`;
    }

    if (normalized.licensePlate)
      updatedData.licensePlate = normalized.licensePlate;
    if (normalized.rcNumber) updatedData.rcNumber = normalized.rcNumber;
    if (normalized.chassisNumber)
      updatedData.chassisNumber = normalized.chassisNumber;
    if (normalized.engineNumber)
      updatedData.engineNumber = normalized.engineNumber;

    const updated = await this.prisma.vehicle.update({
      where: { id },
      data: updatedData,
    });

    this.logger.info(`Updated vehicle ${updated.id} - ${updated.name}`);

    return mapVehicleToResponse(updated);
  }

  /**
   * Delete a vehicle
   */
  async remove(id: string): Promise<{ success: boolean }> {
    const vehicle = await this.prisma.vehicle.findUnique({ where: { id } });
    if (!vehicle)
      throw new NotFoundException(`Vehicle with id ${id} not found`);

    await this.prisma.vehicle.delete({ where: { id } });
    this.logger.info(`Deleted vehicle ${vehicle.id} - ${vehicle.name}`);
    return { success: true };
  }
}
