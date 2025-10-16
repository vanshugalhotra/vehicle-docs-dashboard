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
   * Get paginated list of vehicles
   */
  async findAll(
    skip = 0,
    take = 20,
    filter?: Partial<Record<string, any>>,
  ): Promise<VehicleResponse[]> {
    const vehicles = await this.prisma.vehicle.findMany({
      where: filter ?? {},
      skip,
      take,
      include: {
        category: true,
        type: true,
        owner: true,
        driver: true,
        location: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    this.logger.info(`Fetched ${vehicles.length} vehicles`);
    return vehicles.map(mapVehicleToResponse);
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
            { licensePlate: dto.licensePlate },
            { rcNumber: dto.rcNumber },
            { chassisNumber: dto.chassisNumber },
            { engineNumber: dto.engineNumber },
          ],
        },
      });
      if (conflict)
        throw new ConflictException(
          'Another vehicle with same identifiers exists',
        );
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

      const license = dto.licensePlate ?? vehicle.licensePlate;
      updatedData.name = `${category.name} (${type.name}) - ${license}`;
    }

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
