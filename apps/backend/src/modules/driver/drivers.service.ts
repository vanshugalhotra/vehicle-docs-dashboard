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

@Injectable()
export class DriversService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
  ) {}

  async create(dto: CreateDriverDto): Promise<DriverResponse> {
    const name = dto.name.trim();
    const phone = dto.phone.trim();
    const email = dto.email?.trim();

    this.logger.info(`Creating driver: ${name} (${phone})`);
    try {
      // Check unique phone
      const existing = await this.prisma.driver.findFirst({
        where: { phone },
      });
      if (existing) {
        this.logger.warn(
          `Driver creation failed, phone already exists: ${phone}`,
        );
        throw new ConflictException(
          `Driver with phone "${phone}" already exists`,
        );
      }

      // Optional: check duplicate email if provided
      if (email) {
        const existingEmail = await this.prisma.driver.findFirst({
          where: { email: { equals: email, mode: 'insensitive' } },
        });
        if (existingEmail) {
          this.logger.warn(
            `Driver creation failed, email already exists: ${email}`,
          );
          throw new ConflictException(
            `Driver with email "${email}" already exists`,
          );
        }
      }

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

  async findAll(search?: string): Promise<DriverResponse[]> {
    this.logger.info(
      `Fetching all drivers${search ? ` with search: ${search}` : ''}`,
    );
    try {
      const drivers = await this.prisma.driver.findMany({
        where: search
          ? {
              OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { phone: { contains: search } },
                { email: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {},
        orderBy: { name: 'asc' },
      });

      this.logger.info(`Fetched ${drivers.length} drivers`);
      return drivers.map(mapDriverToResponse);
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
      const driver = await this.prisma.driver.findUnique({ where: { id } });
      if (!driver) {
        this.logger.warn(`Update failed, driver not found: ${id}`);
        throw new NotFoundException(`Driver with id ${id} not found`);
      }

      // Phone uniqueness check if changed
      if (dto.phone && dto.phone !== driver.phone) {
        const existing = await this.prisma.driver.findFirst({
          where: { phone: dto.phone },
        });
        if (existing) {
          this.logger.warn(`Update failed, duplicate phone: ${dto.phone}`);
          throw new ConflictException(
            `Driver with phone "${dto.phone}" already exists`,
          );
        }
      }

      // Email uniqueness check if changed and not null
      if (dto.email && dto.email !== driver.email) {
        const existingEmail = await this.prisma.driver.findFirst({
          where: { email: { equals: dto.email, mode: 'insensitive' } },
        });
        if (existingEmail) {
          this.logger.warn(`Update failed, duplicate email: ${dto.email}`);
          throw new ConflictException(
            `Driver with email "${dto.email}" already exists`,
          );
        }
      }

      const updated = await this.prisma.driver.update({
        where: { id },
        data: {
          name: dto.name ?? driver.name,
          phone: dto.phone ?? driver.phone,
          email:
            dto.email !== undefined ? dto.email?.trim() || null : driver.email,
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
