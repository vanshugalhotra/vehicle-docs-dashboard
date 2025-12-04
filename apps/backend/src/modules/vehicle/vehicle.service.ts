import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { LoggerService, LogContext } from 'src/common/logger/logger.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { mapVehicleToResponse } from './vehicle.mapper';
import {
  VehicleResponse,
  VEHICLE_ALLOWED_BUSINESS_FILTERS,
} from 'src/common/types';
import { Prisma } from '@prisma/client';
import { handlePrismaError } from 'src/common/utils/prisma-error-handler';
import { PaginatedVehicleResponseDto } from './dto/vehicle-response.dto';
import { buildQueryArgs } from 'src/common/utils/query-builder';
import { VehicleValidationService } from './validation/vehicle-validation.service';
import { generateVehicleName } from 'src/common/utils/vehicleUtils';
import { parseBusinessFilters } from 'src/common/business-filters/parser';
import { createVehicleBusinessEngine } from './business-resolvers/business-engine.factory';
import { QueryWithBusinessDto } from 'src/common/dto/query-business.dto';

@Injectable()
export class VehicleService {
  private readonly entity = 'Vehicle';

  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly vehicleValidation: VehicleValidationService,
  ) {}

  async create(dto: CreateVehicleDto): Promise<VehicleResponse> {
    const ctx: LogContext = {
      entity: this.entity,
      action: 'create',
      additional: { dto },
    };
    this.logger.logInfo('Creating vehicle', ctx);

    try {
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

      const category = await this.prisma.vehicleCategory.findUnique({
        where: { id: dto.categoryId },
      });
      const type = await this.prisma.vehicleType.findUnique({
        where: { id: dto.typeId },
      });

      const vehicleName = generateVehicleName(
        category!.name,
        type!.name,
        normalized.licensePlate,
      );

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

      this.logger.logInfo(`Vehicle created`, {
        ...ctx,
        additional: { id: vehicle.id, name: vehicle.name },
      });
      return mapVehicleToResponse(vehicle);
    } catch (error) {
      this.logger.logError('Error creating vehicle', {
        ...ctx,
        additional: { error },
      });
      if (error instanceof Prisma.PrismaClientKnownRequestError)
        handlePrismaError(error, this.entity);
      throw error;
    }
  }

  async findAll(
    query: QueryWithBusinessDto,
  ): Promise<PaginatedVehicleResponseDto> {
    const ctx: LogContext = {
      entity: this.entity,
      action: 'findAll',
      additional: { query },
    };
    this.logger.logInfo('Fetching vehicles', ctx);

    try {
      const { skip, take, where, orderBy } =
        buildQueryArgs<Prisma.VehicleWhereInput>(query, [
          'licensePlate',
          'name',
          'rcNumber',
          'chassisNumber',
          'engineNumber',
        ]);

      const include: Prisma.VehicleInclude = {
        category: true,
        type: true,
        owner: true,
        driver: true,
        location: true,
        ...(query.includeRelations && {
          documents: {
            select: { id: true, documentType: { select: { name: true } } },
          },
        }),
      };

      const parsedBusinessFilters = parseBusinessFilters(
        query.businessFilters,
        VEHICLE_ALLOWED_BUSINESS_FILTERS,
      );
      const engine = createVehicleBusinessEngine();

      const extendedWhere: Prisma.VehicleWhereInput = {
        ...where,
        ...(query.search && {
          OR: [
            ...(Array.isArray(where?.OR)
              ? (where.OR as Prisma.VehicleWhereInput[])
              : []),
            {
              category: {
                name: { contains: query.search, mode: 'insensitive' },
              },
            },
            { type: { name: { contains: query.search, mode: 'insensitive' } } },
            {
              owner: { name: { contains: query.search, mode: 'insensitive' } },
            },
            {
              driver: { name: { contains: query.search, mode: 'insensitive' } },
            },
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

      this.logger.logInfo('Vehicles fetched', {
        ...ctx,
        additional: { count: vehicles.length, total },
      });

      const dtoList = vehicles.map(mapVehicleToResponse);
      const finalList = engine.apply(dtoList, parsedBusinessFilters);

      return { items: finalList, total };
    } catch (error) {
      this.logger.logError('Error fetching vehicles', {
        ...ctx,
        additional: { error },
      });
      if (error instanceof Prisma.PrismaClientKnownRequestError)
        handlePrismaError(error, this.entity);
      throw error;
    }
  }

  async findOne(id: string): Promise<VehicleResponse> {
    const ctx: LogContext = {
      entity: this.entity,
      action: 'findOne',
      additional: { id },
    };
    this.logger.logInfo('Fetching vehicle by id', ctx);

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

      if (!vehicle) {
        this.logger.logWarn('Vehicle not found', ctx);
        throw new NotFoundException(`Vehicle with id ${id} not found`);
      }

      return mapVehicleToResponse(vehicle);
    } catch (error) {
      this.logger.logError('Error fetching vehicle', {
        ...ctx,
        additional: { error },
      });
      if (error instanceof Prisma.PrismaClientKnownRequestError)
        handlePrismaError(error, this.entity);
      throw error;
    }
  }

  async update(id: string, dto: UpdateVehicleDto): Promise<VehicleResponse> {
    const ctx: LogContext = {
      entity: this.entity,
      action: 'update',
      additional: { id, dto },
    };
    this.logger.logInfo('Updating vehicle', ctx);

    try {
      const normalized = {
        licensePlate: dto.licensePlate?.toUpperCase(),
        rcNumber: dto.rcNumber?.toUpperCase(),
        chassisNumber: dto.chassisNumber?.toUpperCase(),
        engineNumber: dto.engineNumber?.toUpperCase(),
      };

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

      const updatedData: Partial<UpdateVehicleDto & { name?: string }> = {
        ...dto,
      };

      if (normalized.licensePlate)
        updatedData.licensePlate = normalized.licensePlate;
      if (normalized.rcNumber) updatedData.rcNumber = normalized.rcNumber;
      if (normalized.chassisNumber)
        updatedData.chassisNumber = normalized.chassisNumber;
      if (normalized.engineNumber)
        updatedData.engineNumber = normalized.engineNumber;

      if (dto.categoryId || dto.typeId || dto.licensePlate) {
        const finalLicensePlate =
          normalized.licensePlate ?? vehicle.licensePlate;
        const finalCategory =
          category ??
          (await this.prisma.vehicleCategory.findUnique({
            where: { id: dto.categoryId ?? vehicle.categoryId },
          }));
        const finalType =
          type ??
          (await this.prisma.vehicleType.findUnique({
            where: { id: dto.typeId ?? vehicle.typeId },
          }));

        updatedData.name = generateVehicleName(
          finalCategory!.name,
          finalType!.name,
          finalLicensePlate,
        );
      }

      const updated = await this.prisma.vehicle.update({
        where: { id },
        data: updatedData,
      });
      this.logger.logInfo('Vehicle updated', {
        ...ctx,
        additional: { id: updated.id, name: updated.name },
      });

      return mapVehicleToResponse(updated);
    } catch (error) {
      this.logger.logError('Error updating vehicle', {
        ...ctx,
        additional: { error },
      });
      if (error instanceof Prisma.PrismaClientKnownRequestError)
        handlePrismaError(error, this.entity);
      throw error;
    }
  }

  async remove(id: string): Promise<{ success: boolean }> {
    const ctx: LogContext = {
      entity: this.entity,
      action: 'remove',
      additional: { id },
    };
    this.logger.logInfo('Deleting vehicle', ctx);

    try {
      const vehicle = await this.prisma.vehicle.findUnique({ where: { id } });
      if (!vehicle) {
        this.logger.logWarn('Vehicle not found', ctx);
        throw new NotFoundException(`Vehicle with id ${id} not found`);
      }

      const linkedDocuments = await this.prisma.vehicleDocument.count({
        where: { vehicleId: id },
      });
      if (linkedDocuments > 0) {
        this.logger.logWarn('Delete failed, linked documents exist', {
          ...ctx,
          additional: { linkedDocuments },
        });
        throw new ConflictException(
          `Cannot delete Vehicle "${vehicle.name}" because ${linkedDocuments} vehicle document(s) are linked to it`,
        );
      }

      await this.prisma.vehicle.delete({ where: { id } });
      this.logger.logInfo('Vehicle deleted', {
        ...ctx,
        additional: { id: vehicle.id, name: vehicle.name },
      });

      return { success: true };
    } catch (error) {
      this.logger.logError('Error deleting vehicle', {
        ...ctx,
        additional: { error },
      });
      if (error instanceof Prisma.PrismaClientKnownRequestError)
        handlePrismaError(error, this.entity);
      throw error;
    }
  }
}
