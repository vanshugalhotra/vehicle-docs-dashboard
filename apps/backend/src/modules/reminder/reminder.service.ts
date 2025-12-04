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
import { LoggerService, LogContext } from 'src/common/logger/logger.service';
import { ReminderRepository } from './reminder.repository';
import {
  SummaryQueueItem,
  GetQueueItemsOptions,
  ReminderRecipientResponse,
} from 'src/common/types/reminder.types';
import { QueryOptionsDto } from 'src/common/dto/query-options.dto';
import { buildQueryArgs } from 'src/common/utils/query-builder';
import { PaginatedRecipientResponseDto } from './dto/reminder-response.dto';
import { ReminderValidationService } from './validation/reminder-validation.service';

@Injectable()
export class ReminderService {
  private readonly entity = 'Reminder';

  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly repo: ReminderRepository,
    private readonly validationService: ReminderValidationService,
  ) {}

  // ----------------------------
  // CONFIG CRUD
  // ----------------------------
  async createConfig(dto: CreateReminderConfigDto) {
    const ctx: LogContext = {
      entity: this.entity,
      action: 'createConfig',
      additional: { dto },
    };
    this.logger.logInfo('Creating reminder config', ctx);

    try {
      const config = await this.prisma.reminderConfig.create({ data: dto });
      this.logger.logInfo('Reminder config created', {
        ...ctx,
        additional: { id: config.id },
      });
      return config;
    } catch (error) {
      this.logger.logError('Failed to create reminder config', {
        ...ctx,
        additional: { error },
      });
      if (error instanceof Prisma.PrismaClientKnownRequestError)
        handlePrismaError(error, 'ReminderConfig');
      throw error;
    }
  }

  async listConfigs() {
    const ctx: LogContext = { entity: this.entity, action: 'listConfigs' };
    this.logger.logDebug('Listing reminder configs', ctx);

    try {
      const configs = await this.prisma.reminderConfig.findMany();
      this.logger.logInfo(`Fetched ${configs.length} configs`, ctx);
      return configs;
    } catch (error) {
      this.logger.logError('Failed to list reminder configs', {
        ...ctx,
        additional: { error },
      });
      if (error instanceof Prisma.PrismaClientKnownRequestError)
        handlePrismaError(error, 'ReminderConfig');
      throw error;
    }
  }

  async getConfig(id: string) {
    const ctx: LogContext = {
      entity: this.entity,
      action: 'getConfig',
      additional: { id },
    };
    this.logger.logInfo('Fetching reminder config by id', ctx);

    try {
      const config = await this.prisma.reminderConfig.findUnique({
        where: { id },
      });
      if (!config) {
        this.logger.logWarn('Reminder config not found', ctx);
        throw new NotFoundException(`ReminderConfig ${id} not found`);
      }
      return config;
    } catch (error) {
      this.logger.logError('Failed to fetch reminder config', {
        ...ctx,
        additional: { error },
      });
      if (error instanceof Prisma.PrismaClientKnownRequestError)
        handlePrismaError(error, 'ReminderConfig');
      throw error;
    }
  }

  async updateConfig(id: string, dto: UpdateReminderConfigDto) {
    const ctx: LogContext = {
      entity: this.entity,
      action: 'updateConfig',
      additional: { id, dto },
    };
    this.logger.logInfo('Updating reminder config', ctx);

    try {
      const config = await this.prisma.reminderConfig.update({
        where: { id },
        data: dto,
      });
      this.logger.logInfo('Reminder config updated', {
        ...ctx,
        additional: { id: config.id },
      });
      return config;
    } catch (error) {
      this.logger.logError('Failed to update reminder config', {
        ...ctx,
        additional: { error },
      });
      if (error instanceof Prisma.PrismaClientKnownRequestError)
        handlePrismaError(error, 'ReminderConfig');
      throw error;
    }
  }

  async deleteConfig(id: string) {
    const ctx: LogContext = {
      entity: this.entity,
      action: 'deleteConfig',
      additional: { id },
    };
    this.logger.logInfo('Deleting reminder config', ctx);

    try {
      const config = await this.prisma.reminderConfig.findUnique({
        where: { id },
      });
      if (!config) {
        this.logger.logWarn('Reminder config not found', ctx);
        throw new NotFoundException(`ReminderConfig ${id} not found`);
      }

      await this.prisma.reminderConfig.delete({ where: { id } });
      this.logger.logInfo('Reminder config deleted', ctx);
      return { success: true };
    } catch (error) {
      this.logger.logError('Failed to delete reminder config', {
        ...ctx,
        additional: { error },
      });
      if (error instanceof Prisma.PrismaClientKnownRequestError)
        handlePrismaError(error, 'ReminderConfig');
      throw error;
    }
  }

  // ----------------------------
  // RECIPIENT CRUD
  // ----------------------------
  async createRecipient(dto: CreateReminderRecipientDto) {
    const ctx: LogContext = {
      entity: this.entity,
      action: 'createRecipient',
      additional: { dto },
    };
    this.logger.logInfo('Creating reminder recipient', ctx);

    try {
      await this.validationService.validateRecipientCreate(dto.email);
      const recipient = await this.prisma.reminderRecipient.create({
        data: dto,
      });
      this.logger.logInfo('Reminder recipient created', {
        ...ctx,
        additional: { id: recipient.id },
      });
      return recipient;
    } catch (error) {
      this.logger.logError('Failed to create reminder recipient', {
        ...ctx,
        additional: { error },
      });
      if (error instanceof Prisma.PrismaClientKnownRequestError)
        handlePrismaError(error, 'ReminderRecipient');
      throw error;
    }
  }

  async updateRecipient(id: string, dto: UpdateReminderRecipientDto) {
    const ctx: LogContext = {
      entity: this.entity,
      action: 'updateRecipient',
      additional: { id, dto },
    };
    this.logger.logInfo('Updating reminder recipient', ctx);

    try {
      await this.validationService.validateRecipientUpdate(id, dto.email);
      const recipient = await this.prisma.reminderRecipient.update({
        where: { id },
        data: dto,
      });
      this.logger.logInfo('Reminder recipient updated', {
        ...ctx,
        additional: { id: recipient.id },
      });
      return recipient;
    } catch (error) {
      this.logger.logError('Failed to update reminder recipient', {
        ...ctx,
        additional: { error },
      });
      if (error instanceof Prisma.PrismaClientKnownRequestError)
        handlePrismaError(error, 'ReminderRecipient');
      throw error;
    }
  }

  async listRecipients(
    query: QueryOptionsDto,
  ): Promise<PaginatedRecipientResponseDto> {
    const ctx: LogContext = {
      entity: this.entity,
      action: 'listRecipients',
      additional: { query },
    };
    this.logger.logDebug('Fetching reminder recipients', ctx);

    try {
      const queryArgs = buildQueryArgs<
        ReminderRecipientResponse,
        Prisma.ReminderRecipientWhereInput
      >(query, ['name', 'email']);
      const [list, total] = await Promise.all([
        this.prisma.reminderRecipient.findMany({
          where: queryArgs.where,
          skip: queryArgs.skip,
          take: queryArgs.take,
          orderBy: queryArgs.orderBy,
        }),
        this.prisma.reminderRecipient.count({ where: queryArgs.where }),
      ]);

      this.logger.logInfo(`Fetched ${list.length} of ${total} recipients`, ctx);

      return {
        items: list.map((r) => ({
          id: r.id,
          name: r.name ?? undefined,
          email: r.email,
          active: r.active,
          createdAt: r.createdAt,
          updatedAt: r.updatedAt,
        })),
        total,
      };
    } catch (error) {
      this.logger.logError('Failed to fetch reminder recipients', {
        ...ctx,
        additional: { error },
      });
      if (error instanceof Prisma.PrismaClientKnownRequestError)
        handlePrismaError(error, 'ReminderRecipient');
      throw error;
    }
  }

  async getRecipient(id: string) {
    const ctx: LogContext = {
      entity: this.entity,
      action: 'getRecipient',
      additional: { id },
    };
    this.logger.logInfo('Fetching reminder recipient by id', ctx);

    try {
      const recipient = await this.prisma.reminderRecipient.findUnique({
        where: { id },
      });
      if (!recipient) {
        this.logger.logWarn('Reminder recipient not found', ctx);
        throw new NotFoundException(`Recipient ${id} not found`);
      }
      return recipient;
    } catch (error) {
      this.logger.logError('Failed to fetch reminder recipient', {
        ...ctx,
        additional: { error },
      });
      if (error instanceof Prisma.PrismaClientKnownRequestError)
        handlePrismaError(error, 'ReminderRecipient');
      throw error;
    }
  }

  async deleteRecipient(id: string) {
    const ctx: LogContext = {
      entity: this.entity,
      action: 'deleteRecipient',
      additional: { id },
    };
    this.logger.logInfo('Deleting reminder recipient', ctx);

    try {
      const recipient = await this.prisma.reminderRecipient.findUnique({
        where: { id },
      });
      if (!recipient) {
        this.logger.logWarn('Reminder recipient not found', ctx);
        throw new NotFoundException(`Recipient ${id} not found`);
      }

      await this.prisma.reminderRecipient.delete({ where: { id } });
      this.logger.logInfo('Reminder recipient deleted', ctx);
      return { success: true };
    } catch (error) {
      this.logger.logError('Failed to delete reminder recipient', {
        ...ctx,
        additional: { error },
      });
      if (error instanceof Prisma.PrismaClientKnownRequestError)
        handlePrismaError(error, 'ReminderRecipient');
      throw error;
    }
  }

  // ----------------------------
  // ADMIN QUEUE FETCH
  // ----------------------------
  async getQueueList(
    options: GetQueueItemsOptions = {},
  ): Promise<SummaryQueueItem[]> {
    const ctx: LogContext = {
      entity: this.entity,
      action: 'getQueueList',
      additional: { options },
    };
    this.logger.logInfo('Fetching queue items', ctx);

    try {
      const finalOptions: GetQueueItemsOptions = {
        status: options.status || 'all',
        fromDate: options.fromDate,
        toDate: options.toDate,
        configId: options.configId,
        includeFailed: options.includeFailed ?? options.status === 'all',
      };

      const result = await this.repo.getQueueItems(finalOptions);
      this.logger.logInfo(`Fetched ${result.length} queue items`, ctx);
      return result;
    } catch (error) {
      this.logger.logError('Failed to fetch queue items', {
        ...ctx,
        additional: { error },
      });
      if (error instanceof Prisma.PrismaClientKnownRequestError)
        handlePrismaError(error, 'ReminderQueue');
      throw error;
    }
  }

  async clearQueue() {
    const ctx: LogContext = { entity: this.entity, action: 'clearQueue' };
    this.logger.logInfo('Clearing reminder queue', ctx);

    try {
      await this.repo.clearQueue();
      this.logger.logInfo('Reminder queue cleared', ctx);
      return { success: true, message: 'Reminder queue cleared successfully' };
    } catch (error) {
      this.logger.logError('Failed to clear reminder queue', {
        ...ctx,
        additional: { error },
      });
      if (error instanceof Prisma.PrismaClientKnownRequestError)
        handlePrismaError(error, 'ReminderQueue');
      throw error;
    }
  }
}
