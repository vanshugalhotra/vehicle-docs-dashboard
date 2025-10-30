import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { LoggerService } from 'src/common/logger/logger.service';
import { handlePrismaError } from 'src/common/utils/prisma-error-handler';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';
import { mapDriverToResponse } from './driver.mapper';
import { DriverResponse } from 'src/common/types';
import { Prisma } from '@prisma/client';
import { buildQueryArgs } from 'src/common/utils/query-builder';
import { PaginatedDriverResponseDto } from './dto/driver-response.dto';
import { QueryOptionsDto } from 'src/common/dto/query-options.dto';
import { DriverValidationService } from './validation/driver-validation.service';

@Injectable()
export class DriverService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly driverValidation: DriverValidationService,
  ) {}

  async create(dto: CreateDriverDto): Promise<DriverResponse> {
    const name = dto.name;
    const phone = dto.phone;
    const email = dto.email;

    this.logger.info(`Creating driver: ${name} (${phone})`);
    try {
      await this.driverValidation.validateCreate(phone, email);
      const driver = await this.prisma.driver.create({
        data: {
          name,
          phone,
          email: email || null,
        },
      });

      this.logger.info(`Driver created: ${driver.id}`);
      return mapDriverToResponse(driver);
    } catch (error) {
      handlePrismaError(error, 'Driver');
    }
  }

  async findAll(query: QueryOptionsDto): Promise<PaginatedDriverResponseDto> {
    this.logger.debug(
      `Fetching drivers with params: ${JSON.stringify(query, null, 2)}`,
    );

    try {
      const queryArgs = buildQueryArgs<DriverResponse, Prisma.DriverWhereInput>(
        query,
        ['name', 'phone', 'email'], // Searchable fields
      );

      const [drivers, total] = await Promise.all([
        this.prisma.driver.findMany({
          where: queryArgs.where,
          skip: queryArgs.skip,
          take: queryArgs.take,
          orderBy: queryArgs.orderBy,
        }),
        this.prisma.driver.count({ where: queryArgs.where }),
      ]);

      this.logger.info(`Fetched ${drivers.length} of ${total} drivers`);

      return {
        items: drivers.map(mapDriverToResponse),
        total,
      };
    } catch (error) {
      handlePrismaError(error, 'Driver');
    }
  }
  async findOne(id: string): Promise<DriverResponse> {
    this.logger.info(`Fetching driver by id: ${id}`);
    try {
      const driver = await this.prisma.driver.findUnique({ where: { id } });
      if (!driver) {
        this.logger.warn(`Driver not found: ${id}`);
        throw new NotFoundException(`Driver with id ${id} not found`);
      }
      return mapDriverToResponse(driver);
    } catch (error) {
      handlePrismaError(error, 'Driver');
    }
  }

  async update(id: string, dto: UpdateDriverDto): Promise<DriverResponse> {
    this.logger.info(`Updating driver: ${id}`);
    try {
      const driver = await this.driverValidation.validateUpdate(
        id,
        dto.phone,
        dto.email,
      );

      const updated = await this.prisma.driver.update({
        where: { id },
        data: {
          name: dto.name ?? driver.name,
          phone: dto.phone ?? driver.phone,
          email: dto.email !== undefined ? dto.email || null : driver.email,
        },
      });

      this.logger.info(`Driver updated: ${updated.id}`);
      return mapDriverToResponse(updated);
    } catch (error) {
      handlePrismaError(error, 'Driver');
    }
  }

  async remove(id: string): Promise<{ success: boolean }> {
    this.logger.info(`Deleting driver: ${id}`);
    try {
      const driver = await this.prisma.driver.findUnique({ where: { id } });
      if (!driver) {
        this.logger.warn(`Delete failed, driver not found: ${id}`);
        throw new NotFoundException(`Driver with id ${id} not found`);
      }

      // Prevent deletion if any vehicle is linked
      const linkedVehicles = await this.prisma.vehicle.count({
        where: { driverId: id },
      });
      if (linkedVehicles > 0) {
        this.logger.warn(
          `Delete failed, driver has ${linkedVehicles} assigned vehicle(s): ${id}`,
        );
        throw new ConflictException(
          `Cannot delete driver "${driver.name}" because ${linkedVehicles} vehicle(s) are assigned`,
        );
      }

      await this.prisma.driver.delete({ where: { id } });
      this.logger.info(`Driver deleted: ${id}`);
      return { success: true };
    } catch (error) {
      handlePrismaError(error, 'Driver');
    }
  }
}
