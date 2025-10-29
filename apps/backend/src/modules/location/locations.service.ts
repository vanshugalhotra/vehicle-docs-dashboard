import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { LoggerService } from 'src/common/logger/logger.service';
import { handlePrismaError } from 'src/common/utils/prisma-error-handler';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { mapLocationToResponse } from './location.mapper';
import { LocationResponse } from 'src/common/types';
import { Prisma } from '@prisma/client';
import { buildQueryArgs } from 'src/common/utils/query-builder';
import { QueryOptionsDto } from 'src/common/dto/query-options.dto';
import { PaginatedLocationResponseDto } from './dto/location-response';

@Injectable()
export class LocationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
  ) {}

  async create(dto: CreateLocationDto): Promise<LocationResponse> {
    const name = dto.name.trim();
    this.logger.info(`Creating location: ${name}`);
    try {
      const existing = await this.prisma.location.findFirst({
        where: { name: { equals: name, mode: 'insensitive' } },
      });
      if (existing) {
        this.logger.warn(`Location creation failed, already exists: ${name}`);
        throw new ConflictException(
          `Location with name "${name}" already exists`,
        );
      }

      const location = await this.prisma.location.create({
        data: { name },
      });
      this.logger.info(`Location created: ${location.id}`);
      return mapLocationToResponse(location);
    } catch (error) {
      handlePrismaError(error, 'Location');
    }
  }

  async findAll(query: QueryOptionsDto): Promise<PaginatedLocationResponseDto> {
    this.logger.debug(
      `Fetching locations with params: ${JSON.stringify(query, null, 2)}`,
    );

    try {
      const queryArgs = buildQueryArgs<
        LocationResponse,
        Prisma.LocationWhereInput
      >(
        query,
        ['name'], // Searchable fields
      );

      const [locations, total] = await Promise.all([
        this.prisma.location.findMany({
          where: queryArgs.where,
          skip: queryArgs.skip,
          take: queryArgs.take,
          orderBy: queryArgs.orderBy,
        }),
        this.prisma.location.count({ where: queryArgs.where }),
      ]);

      this.logger.info(`Fetched ${locations.length} of ${total} locations`);

      return {
        items: locations.map(mapLocationToResponse),
        total,
      };
    } catch (error) {
      handlePrismaError(error, 'Location');
    }
  }

  async findOne(id: string): Promise<LocationResponse> {
    this.logger.info(`Fetching location by id: ${id}`);
    try {
      const location = await this.prisma.location.findUnique({ where: { id } });
      if (!location) {
        this.logger.warn(`Location not found: ${id}`);
        throw new NotFoundException(`Location with id ${id} not found`);
      }
      return mapLocationToResponse(location);
    } catch (error) {
      handlePrismaError(error, 'Location');
    }
  }

  async update(id: string, dto: UpdateLocationDto): Promise<LocationResponse> {
    this.logger.info(`Updating location: ${id}`);
    try {
      const location = await this.prisma.location.findUnique({ where: { id } });
      if (!location) {
        this.logger.warn(`Update failed, location not found: ${id}`);
        throw new NotFoundException(`Location with id ${id} not found`);
      }

      if (dto.name && dto.name !== location.name) {
        const existing = await this.prisma.location.findFirst({
          where: { name: { equals: dto.name, mode: 'insensitive' } },
        });
        if (existing) {
          this.logger.warn(
            `Update failed, duplicate location name: ${dto.name}`,
          );
          throw new ConflictException(
            `Location with name "${dto.name}" already exists`,
          );
        }
      }

      const updated = await this.prisma.location.update({
        where: { id },
        data: { name: dto.name ?? location.name },
      });
      this.logger.info(`Location updated: ${updated.id}`);
      return mapLocationToResponse(updated);
    } catch (error) {
      handlePrismaError(error, 'Location');
    }
  }

  async remove(id: string): Promise<{ success: boolean }> {
    this.logger.info(`Deleting location: ${id}`);
    try {
      const location = await this.prisma.location.findUnique({ where: { id } });
      if (!location) {
        this.logger.warn(`Delete failed, location not found: ${id}`);
        throw new NotFoundException(`Location with id ${id} not found`);
      }

      const linkedVehicles = await this.prisma.vehicle.count({
        where: { locationId: id },
      });
      if (linkedVehicles > 0) {
        this.logger.warn(
          `Delete failed, location has ${linkedVehicles} assigned vehicle(s): ${id}`,
        );
        throw new ConflictException(
          `Cannot delete location "${location.name}" because ${linkedVehicles} vehicle(s) are assigned`,
        );
      }

      await this.prisma.location.delete({ where: { id } });
      this.logger.info(`Location deleted: ${id}`);
      return { success: true };
    } catch (error) {
      handlePrismaError(error, 'Location');
    }
  }
}
