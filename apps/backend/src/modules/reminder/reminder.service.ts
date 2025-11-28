import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ReminderRepository } from './reminder.repository';
import { Prisma } from '@prisma/client';
import { handlePrismaError } from 'src/common/utils/prisma-error-handler';
import { addDays } from 'src/common/utils/date-utils';
import {
  CreateReminderConfigDto,
  CreateReminderRecipientDto,
} from './dto/create-reminder.dto';
import {
  UpdateReminderConfigDto,
  UpdateReminderRecipientDto,
} from './dto/update-reminder.dto';
import {
  ReminderConfig,
  ReminderRecipient,
  ReminderQueue,
  VehicleDocument,
  Vehicle,
  DocumentType,
} from '@prisma/client';
import { ReminderEmailPayload } from 'src/common/types/reminder.types';

@Injectable()
export class ReminderService {
  private readonly logger = new Logger(ReminderService.name);

  constructor(
    private readonly repo: ReminderRepository,
    private readonly prisma: PrismaService,
  ) {}

  // -------------------------------------------------------------------
  // REMINDER CONFIG CRUD
  // -------------------------------------------------------------------
  async createConfig(dto: CreateReminderConfigDto): Promise<ReminderConfig> {
    this.logger.log(`Creating reminder config: ${dto.name}`);
    try {
      return await this.prisma.reminderConfig.create({ data: dto });
    } catch (error: unknown) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        handlePrismaError(error, 'ReminderConfig');
      }
      throw error;
    }
  }

  async listConfigs(): Promise<ReminderConfig[]> {
    this.logger.debug('Listing all reminder configs');
    try {
      return await this.prisma.reminderConfig.findMany();
    } catch (error: unknown) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        handlePrismaError(error, 'ReminderConfig');
      }
      throw error;
    }
  }

  async getConfig(id: string): Promise<ReminderConfig> {
    this.logger.log(`Fetching reminder config by id: ${id}`);
    try {
      const config = await this.prisma.reminderConfig.findUnique({
        where: { id },
      });
      if (!config)
        throw new NotFoundException(`ReminderConfig with id ${id} not found`);
      return config;
    } catch (error: unknown) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        handlePrismaError(error, 'ReminderConfig');
      }
      throw error;
    }
  }

  async updateConfig(
    id: string,
    dto: UpdateReminderConfigDto,
  ): Promise<ReminderConfig> {
    this.logger.log(`Updating reminder config: ${id}`);
    try {
      return await this.prisma.reminderConfig.update({
        where: { id },
        data: dto,
      });
    } catch (error: unknown) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        handlePrismaError(error, 'ReminderConfig');
      }
      throw error;
    }
  }

  async deleteConfig(id: string) {
    this.logger.log(`Deleting reminder config: ${id}`);
    try {
      const config = await this.prisma.reminderConfig.findUnique({
        where: { id },
      });
      if (!config)
        throw new NotFoundException(`ReminderConfig with id ${id} not found`);

      await this.prisma.reminderConfig.delete({ where: { id } });
      this.logger.log(`Reminder config deleted: ${id}`);
      return { success: true };
    } catch (error: unknown) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        handlePrismaError(error, 'ReminderConfig');
      }
      throw error;
    }
  }

  // -------------------------------------------------------------------
  // REMINDER RECIPIENT CRUD
  // -------------------------------------------------------------------
  async createRecipient(
    dto: CreateReminderRecipientDto,
  ): Promise<ReminderRecipient> {
    this.logger.log(`Creating reminder recipient: ${dto.name}`);
    try {
      return await this.prisma.reminderRecipient.create({ data: dto });
    } catch (error: unknown) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        handlePrismaError(error, 'ReminderRecipient');
      }
      throw error;
    }
  }

  async listRecipients(): Promise<ReminderRecipient[]> {
    this.logger.debug('Listing all reminder recipients');
    try {
      return await this.prisma.reminderRecipient.findMany();
    } catch (error: unknown) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        handlePrismaError(error, 'ReminderRecipient');
      }
      throw error;
    }
  }

  async getRecipient(id: string): Promise<ReminderRecipient> {
    this.logger.log(`Fetching reminder recipient by id: ${id}`);
    try {
      const recipient = await this.prisma.reminderRecipient.findUnique({
        where: { id },
      });
      if (!recipient)
        throw new NotFoundException(`Recipient with id ${id} not found`);
      return recipient;
    } catch (error: unknown) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        handlePrismaError(error, 'ReminderRecipient');
      }
      throw error;
    }
  }

  async updateRecipient(
    id: string,
    dto: UpdateReminderRecipientDto,
  ): Promise<ReminderRecipient> {
    this.logger.log(`Updating reminder recipient: ${id}`);
    try {
      return await this.prisma.reminderRecipient.update({
        where: { id },
        data: dto,
      });
    } catch (error: unknown) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        handlePrismaError(error, 'ReminderRecipient');
      }
      throw error;
    }
  }

  async deleteRecipient(id: string) {
    this.logger.log(`Deleting reminder recipient: ${id}`);
    try {
      const recipient = await this.prisma.reminderRecipient.findUnique({
        where: { id },
      });
      if (!recipient)
        throw new NotFoundException(`Recipient with id ${id} not found`);

      await this.prisma.reminderRecipient.delete({ where: { id } });
      this.logger.log(`Reminder recipient deleted: ${id}`);
      return { success: true };
    } catch (error: unknown) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        handlePrismaError(error, 'ReminderRecipient');
      }
      throw error;
    }
  }

  // -------------------------------------------------------------------
  // ADMIN: Get queue (filter recent)
  // -------------------------------------------------------------------
  async getQueueList(filter: { days?: number }) {
    const days = filter.days ?? 30;
    const start = addDays(new Date(), -days);
    this.logger.debug(`Fetching reminder queue for last ${days} days`);

    try {
      return await this.prisma.reminderQueue.findMany({
        where: { scheduledAt: { gte: start } },
        orderBy: { scheduledAt: 'desc' },
        include: {
          vehicleDocument: { include: { vehicle: true, documentType: true } },
          reminderConfig: true,
        },
      });
    } catch (error: unknown) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        handlePrismaError(error, 'ReminderQueue');
      }
      throw error;
    }
  }

  // -------------------------------------------------------------------
  // OPTIONAL: Cleanup old queue items
  // -------------------------------------------------------------------
  async cleanupHistory(days = 90) {
    this.logger.log(`Cleaning up reminder queue older than ${days} days`);
    try {
      return await this.repo.cleanupOldHistory(days);
    } catch (error: unknown) {
      this.logger.error('Failed to cleanup reminder queue', error);
      throw error;
    }
  }

  // -------------------------------------------------------------------
  // PAYLOAD BUILDER (used later by cron/email)
  // -------------------------------------------------------------------
  buildEmailPayload(
    entry: ReminderQueue & {
      vehicleDocument: VehicleDocument & {
        vehicle: Vehicle;
        documentType: DocumentType;
      };
      reminderConfig: ReminderConfig;
    },
    recipients: ReminderRecipient[],
  ): ReminderEmailPayload {
    const { vehicleDocument: doc, reminderConfig: config } = entry;
    const { vehicle } = doc;

    return {
      configId: config.id,
      recipients: recipients.map((r) => r.email),
      document: {
        type: doc.documentType.name,
        number: doc.documentNo,
        expiryDate: doc.expiryDate,
      },
      vehicle: {
        id: vehicle.id,
        name: vehicle.name,
        licensePlate: vehicle.licensePlate,
      },
      scheduledAt: entry.scheduledAt,
    };
  }
}
