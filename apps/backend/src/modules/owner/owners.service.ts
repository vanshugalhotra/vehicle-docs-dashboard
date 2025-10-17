import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { LoggerService } from 'src/common/logger/logger.service';
import { handlePrismaError } from 'src/common/utils/prisma-error-handler';
import { CreateOwnerDto } from './dto/create-owner.dto';
import { UpdateOwnerDto } from './dto/update-owner.dto';
import { mapOwnerToResponse } from './owner.mapper';
import { OwnerResponse } from 'src/common/types';

@Injectable()
export class OwnersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
  ) {}

  async create(dto: CreateOwnerDto): Promise<OwnerResponse> {
    const name = dto.name.trim();
    this.logger.info(`Creating owner: ${name}`);
    try {
      const existing = await this.prisma.owner.findFirst({
        where: { name: { equals: name, mode: 'insensitive' } },
      });
      if (existing) {
        this.logger.warn(`Owner creation failed, already exists: ${name}`);
        throw new ConflictException(`Owner with name "${name}" already exists`);
      }

      const owner = await this.prisma.owner.create({
        data: { name: name },
      });
      this.logger.info(`Owner created: ${owner.id}`);
      return mapOwnerToResponse(owner);
    } catch (error) {
      handlePrismaError(error, 'Owner');
    }
  }

  async findAll(search?: string): Promise<OwnerResponse[]> {
    this.logger.info(
      `Fetching all owners${search ? ` with search: ${search}` : ''}`,
    );
    try {
      const owners = await this.prisma.owner.findMany({
        where: search
          ? { name: { contains: search, mode: 'insensitive' } }
          : {},
        orderBy: { name: 'asc' },
      });
      this.logger.info(`Fetched ${owners.length} owners`);
      return owners.map(mapOwnerToResponse);
    } catch (error) {
      handlePrismaError(error, 'Owner');
    }
  }

  async findOne(id: string): Promise<OwnerResponse> {
    this.logger.info(`Fetching owner by id: ${id}`);
    try {
      const owner = await this.prisma.owner.findUnique({ where: { id } });
      if (!owner) {
        this.logger.warn(`Owner not found: ${id}`);
        throw new NotFoundException(`Owner with id ${id} not found`);
      }
      return mapOwnerToResponse(owner);
    } catch (error) {
      handlePrismaError(error, 'Owner');
    }
  }

  async update(id: string, dto: UpdateOwnerDto): Promise<OwnerResponse> {
    this.logger.info(`Updating owner: ${id}`);
    try {
      const owner = await this.prisma.owner.findUnique({ where: { id } });
      if (!owner) {
        this.logger.warn(`Update failed, owner not found: ${id}`);
        throw new NotFoundException(`Owner with id ${id} not found`);
      }

      if (dto.name && dto.name !== owner.name) {
        const existing = await this.prisma.owner.findFirst({
          where: { name: { equals: dto.name, mode: 'insensitive' } },
        });
        if (existing) {
          this.logger.warn(`Update failed, duplicate owner name: ${dto.name}`);
          throw new ConflictException(
            `Owner with name "${dto.name}" already exists`,
          );
        }
      }

      const updated = await this.prisma.owner.update({
        where: { id },
        data: { name: dto.name ?? owner.name },
      });
      this.logger.info(`Owner updated: ${updated.id}`);
      return mapOwnerToResponse(updated);
    } catch (error) {
      handlePrismaError(error, 'Owner');
    }
  }

  async remove(id: string): Promise<{ success: boolean }> {
    this.logger.info(`Deleting owner: ${id}`);
    try {
      const owner = await this.prisma.owner.findUnique({ where: { id } });
      if (!owner) {
        this.logger.warn(`Delete failed, owner not found: ${id}`);
        throw new NotFoundException(`Owner with id ${id} not found`);
      }

      // Prevent deletion if any vehicle is linked
      const linkedVehicles = await this.prisma.vehicle.count({
        where: { ownerId: id },
      });
      if (linkedVehicles > 0) {
        this.logger.warn(
          `Delete failed, owner has ${linkedVehicles} assigned vehicle(s): ${id}`,
        );
        throw new ConflictException(
          `Cannot delete owner "${owner.name}" because ${linkedVehicles} vehicle(s) are assigned`,
        );
      }

      await this.prisma.owner.delete({ where: { id } });
      this.logger.info(`Owner deleted: ${id}`);
      return { success: true };
    } catch (error) {
      handlePrismaError(error, 'Owner');
    }
  }
}
