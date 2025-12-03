import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { LoggerService, LogContext } from 'src/common/logger/logger.service';
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
  private readonly entity = 'Driver';

  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly driverValidation: DriverValidationService,
  ) {}

  async create(dto: CreateDriverDto): Promise<DriverResponse> {
    const ctx: LogContext = {
      entity: this.entity,
      action: 'create',
      additional: { dto },
    };
    this.logger.logInfo(`Creating driver`, ctx);

    try {
      await this.driverValidation.validateCreate(dto.phone, dto.email);

      const driver = await this.prisma.driver.create({
        data: {
          name: dto.name,
          phone: dto.phone,
          email: dto.email || null,
        },
      });

      this.logger.logInfo(`Driver created`, {
        ...ctx,
        additional: { id: driver.id },
      });
      return mapDriverToResponse(driver);
    } catch (error) {
      this.logger.logError('Error creating driver', {
        ...ctx,
        additional: { error },
      });
      if (error instanceof Prisma.PrismaClientKnownRequestError)
        handlePrismaError(error, this.entity);
      throw error;
    }
  }

  async findAll(query: QueryOptionsDto): Promise<PaginatedDriverResponseDto> {
    const ctx: LogContext = {
      entity: this.entity,
      action: 'findAll',
      additional: { query },
    };
    this.logger.logDebug('Fetching drivers', ctx);

    try {
      const queryArgs = buildQueryArgs<DriverResponse, Prisma.DriverWhereInput>(
        query,
        ['name', 'phone', 'email'],
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

      this.logger.logInfo('Fetched drivers', {
        ...ctx,
        additional: { count: drivers.length, total },
      });

      return {
        items: drivers.map(mapDriverToResponse),
        total,
      };
    } catch (error) {
      this.logger.logError('Error fetching drivers', {
        ...ctx,
        additional: { error },
      });
      if (error instanceof Prisma.PrismaClientKnownRequestError)
        handlePrismaError(error, this.entity);
      throw error;
    }
  }

  async findOne(id: string): Promise<DriverResponse> {
    const ctx: LogContext = {
      entity: this.entity,
      action: 'findOne',
      additional: { id },
    };
    this.logger.logInfo(`Fetching driver by id`, ctx);

    try {
      const driver = await this.prisma.driver.findUnique({ where: { id } });
      if (!driver) {
        this.logger.logWarn(`Driver not found`, ctx);
        throw new NotFoundException(`Driver with id ${id} not found`);
      }

      return mapDriverToResponse(driver);
    } catch (error) {
      this.logger.logError('Error fetching driver', {
        ...ctx,
        additional: { error },
      });
      if (error instanceof Prisma.PrismaClientKnownRequestError)
        handlePrismaError(error, this.entity);
      throw error;
    }
  }

  async update(id: string, dto: UpdateDriverDto): Promise<DriverResponse> {
    const ctx: LogContext = {
      entity: this.entity,
      action: 'update',
      additional: { id, dto },
    };
    this.logger.logInfo(`Updating driver`, ctx);

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

      this.logger.logInfo(`Driver updated`, {
        ...ctx,
        additional: { updatedId: updated.id },
      });
      return mapDriverToResponse(updated);
    } catch (error) {
      this.logger.logError('Error updating driver', {
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
    this.logger.logInfo(`Deleting driver`, ctx);

    try {
      const driver = await this.prisma.driver.findUnique({ where: { id } });
      if (!driver) {
        this.logger.logWarn(`Delete failed, driver not found`, ctx);
        throw new NotFoundException(`Driver with id ${id} not found`);
      }

      const linkedVehicles = await this.prisma.vehicle.count({
        where: { driverId: id },
      });
      if (linkedVehicles > 0) {
        this.logger.logWarn(`Delete failed, driver has assigned vehicles`, {
          ...ctx,
          additional: { linkedVehicles },
        });
        throw new ConflictException(
          `Cannot delete driver "${driver.name}" because ${linkedVehicles} vehicle(s) are assigned`,
        );
      }

      await this.prisma.driver.delete({ where: { id } });
      this.logger.logInfo(`Driver deleted`, {
        ...ctx,
        additional: { deletedId: id },
      });
      return { success: true };
    } catch (error) {
      this.logger.logError('Error deleting driver', {
        ...ctx,
        additional: { error },
      });
      if (error instanceof Prisma.PrismaClientKnownRequestError)
        handlePrismaError(error, this.entity);
      throw error;
    }
  }
}
