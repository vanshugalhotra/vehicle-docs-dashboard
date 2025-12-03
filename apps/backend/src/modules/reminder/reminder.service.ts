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
import { ReminderRepository } from './reminder.repository';
import {
  SummaryQueueItem,
  GetQueueItemsOptions,
  ReminderRecipientResponse,
} from 'src/common/types/reminder.types';
import { QueryOptionsDto } from 'src/common/dto/query-options.dto';
import { buildQueryArgs } from 'src/common/utils/query-builder';
import { PaginatedRecipientResponseDto } from './dto/reminder-response.dto';

@Injectable()
export class ReminderService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly repo: ReminderRepository,
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
  async listRecipients(
    query: QueryOptionsDto,
  ): Promise<PaginatedRecipientResponseDto> {
    this.logger.debug(
      `Fetching reminder recipients with params: ${JSON.stringify(query, null, 2)}`,
    );

    try {
      const queryArgs = buildQueryArgs<
        ReminderRecipientResponse,
        Prisma.ReminderRecipientWhereInput
      >(query, ['name', 'email']); // searchable fields

      const [list, total] = await Promise.all([
        this.prisma.reminderRecipient.findMany({
          where: queryArgs.where,
          skip: queryArgs.skip,
          take: queryArgs.take,
          orderBy: queryArgs.orderBy,
        }),
        this.prisma.reminderRecipient.count({
          where: queryArgs.where,
        }),
      ]);

      this.logger.info(`Fetched ${list.length} of ${total} recipients`);

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
    } catch (error: unknown) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        handlePrismaError(error, 'ReminderRecipient');
      }
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
  async getQueueList(
    options: GetQueueItemsOptions = {},
  ): Promise<SummaryQueueItem[]> {
    this.logger.info('Fetching queue items with options', { options });

    try {
      const finalOptions: GetQueueItemsOptions = {
        status: options.status || 'all',
        fromDate: options.fromDate,
        toDate: options.toDate,
        configId: options.configId,
        includeFailed:
          options.includeFailed ?? (options.status === 'all' ? true : false),
      };

      const result = await this.repo.getQueueItems(finalOptions);
      this.logger.info(`Fetched ${result.length} queue items`);
      return result;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('Failed to fetch queue items', {
        error: errorMessage,
        options,
      });

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        handlePrismaError(error, 'ReminderQueue');
      }
      throw error;
    }
  }

  async clearQueue(): Promise<object> {
    try {
      await this.repo.clearQueue();
      return {
        success: true,
        message: 'Reminder queue cleared successfully',
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('Failed to clear reminder queue', {
        error: errorMessage,
      });

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        handlePrismaError(error, 'ReminderQueue');
      }
      throw error;
    }
  }
}
