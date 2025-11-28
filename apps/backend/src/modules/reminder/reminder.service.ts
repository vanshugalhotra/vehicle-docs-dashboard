import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { handlePrismaError } from 'src/common/utils/prisma-error-handler';
import {
  CreateReminderConfigDto,
  CreateReminderRecipientDto,
} from './dto/create-reminder.dto';
import {
  UpdateReminderConfigDto,
  UpdateReminderRecipientDto,
} from './dto/update-reminder.dto';
import { ReminderConfig, ReminderRecipient } from '@prisma/client';
import { LoggerService } from 'src/common/logger/logger.service';
import { addDays } from 'src/common/utils/date-utils';

@Injectable()
export class ReminderService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
  ) {}

  // -------------------------------------------------------------------
  // CONFIG CRUD
  // -------------------------------------------------------------------
  async createConfig(dto: CreateReminderConfigDto): Promise<ReminderConfig> {
    this.logger.info(`Creating reminder config: ${dto.name}`);
    try {
      return await this.prisma.reminderConfig.create({ data: dto });
    } catch (error: unknown) {
      if (error instanceof Prisma.PrismaClientKnownRequestError)
        handlePrismaError(error, 'ReminderConfig');
      throw error;
    }
  }

  async listConfigs(): Promise<ReminderConfig[]> {
    this.logger.debug('Listing reminder configs');
    try {
      return await this.prisma.reminderConfig.findMany();
    } catch (error: unknown) {
      if (error instanceof Prisma.PrismaClientKnownRequestError)
        handlePrismaError(error, 'ReminderConfig');
      throw error;
    }
  }

  async getConfig(id: string): Promise<ReminderConfig> {
    this.logger.info(`Fetching reminder config by id: ${id}`);
    try {
      const config = await this.prisma.reminderConfig.findUnique({
        where: { id },
      });
      if (!config)
        throw new NotFoundException(`ReminderConfig ${id} not found`);
      return config;
    } catch (error: unknown) {
      if (error instanceof Prisma.PrismaClientKnownRequestError)
        handlePrismaError(error, 'ReminderConfig');
      throw error;
    }
  }

  async updateConfig(
    id: string,
    dto: UpdateReminderConfigDto,
  ): Promise<ReminderConfig> {
    this.logger.info(`Updating reminder config: ${id}`);
    try {
      return await this.prisma.reminderConfig.update({
        where: { id },
        data: dto,
      });
    } catch (error: unknown) {
      if (error instanceof Prisma.PrismaClientKnownRequestError)
        handlePrismaError(error, 'ReminderConfig');
      throw error;
    }
  }

  async deleteConfig(id: string): Promise<{ success: boolean }> {
    this.logger.info(`Deleting reminder config: ${id}`);
    try {
      const config = await this.prisma.reminderConfig.findUnique({
        where: { id },
      });
      if (!config)
        throw new NotFoundException(`ReminderConfig ${id} not found`);

      await this.prisma.reminderConfig.delete({ where: { id } });
      this.logger.info(`Reminder config deleted: ${id}`);
      return { success: true };
    } catch (error: unknown) {
      if (error instanceof Prisma.PrismaClientKnownRequestError)
        handlePrismaError(error, 'ReminderConfig');
      throw error;
    }
  }

  // -------------------------------------------------------------------
  // RECIPIENT CRUD
  // -------------------------------------------------------------------
  async createRecipient(
    dto: CreateReminderRecipientDto,
  ): Promise<ReminderRecipient> {
    this.logger.info(`Creating reminder recipient: ${dto.name}`);
    try {
      return await this.prisma.reminderRecipient.create({ data: dto });
    } catch (error: unknown) {
      if (error instanceof Prisma.PrismaClientKnownRequestError)
        handlePrismaError(error, 'ReminderRecipient');
      throw error;
    }
  }

  async listRecipients(): Promise<ReminderRecipient[]> {
    this.logger.debug('Listing reminder recipients');
    try {
      return await this.prisma.reminderRecipient.findMany();
    } catch (error: unknown) {
      if (error instanceof Prisma.PrismaClientKnownRequestError)
        handlePrismaError(error, 'ReminderRecipient');
      throw error;
    }
  }

  async getRecipient(id: string): Promise<ReminderRecipient> {
    this.logger.info(`Fetching reminder recipient by id: ${id}`);
    try {
      const recipient = await this.prisma.reminderRecipient.findUnique({
        where: { id },
      });
      if (!recipient) throw new NotFoundException(`Recipient ${id} not found`);
      return recipient;
    } catch (error: unknown) {
      if (error instanceof Prisma.PrismaClientKnownRequestError)
        handlePrismaError(error, 'ReminderRecipient');
      throw error;
    }
  }

  async updateRecipient(
    id: string,
    dto: UpdateReminderRecipientDto,
  ): Promise<ReminderRecipient> {
    this.logger.info(`Updating reminder recipient: ${id}`);
    try {
      return await this.prisma.reminderRecipient.update({
        where: { id },
        data: dto,
      });
    } catch (error: unknown) {
      if (error instanceof Prisma.PrismaClientKnownRequestError)
        handlePrismaError(error, 'ReminderRecipient');
      throw error;
    }
  }

  async deleteRecipient(id: string): Promise<{ success: boolean }> {
    this.logger.info(`Deleting reminder recipient: ${id}`);
    try {
      const recipient = await this.prisma.reminderRecipient.findUnique({
        where: { id },
      });
      if (!recipient) throw new NotFoundException(`Recipient ${id} not found`);

      await this.prisma.reminderRecipient.delete({ where: { id } });
      this.logger.info(`Reminder recipient deleted: ${id}`);
      return { success: true };
    } catch (error: unknown) {
      if (error instanceof Prisma.PrismaClientKnownRequestError)
        handlePrismaError(error, 'ReminderRecipient');
      throw error;
    }
  }

  // -------------------------------------------------------------------
  // ADMIN QUEUE FETCH
  // -------------------------------------------------------------------
  async getQueueList(filter: { days?: number }) {
    const days = filter.days ?? 30;
    const startDate = addDays(new Date(), -days);

    try {
      return await this.prisma.reminderQueue.findMany({
        where: {
          scheduledAt: { gte: startDate },
        },
        orderBy: { scheduledAt: 'desc' },
        include: {
          vehicleDocument: {
            include: {
              vehicle: true,
              documentType: true,
            },
          },
          reminderConfig: true,
        },
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('Failed to fetch reminder queue', {
        error: errorMessage,
      });
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        handlePrismaError(error, 'ReminderQueue');
      }
      throw error;
    }
  }
}
