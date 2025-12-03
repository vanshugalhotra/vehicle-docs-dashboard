import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiResponse, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ReminderService } from './reminder.service';
import { ReminderTriggerService } from './reminder-trigger.service';
import {
  CreateReminderConfigDto,
  CreateReminderRecipientDto,
} from './dto/create-reminder.dto';

import {
  UpdateReminderConfigDto,
  UpdateReminderRecipientDto,
} from './dto/update-reminder.dto';
import { TriggerReminderDto, GetQueueItemsDto } from './dto/query.dto';

import {
  ReminderConfigResponseDto,
  ReminderQueueResponseDto,
  ReminderRecipientResponseDto,
  PaginatedRecipientResponseDto,
} from './dto/reminder-response.dto';
import { ReminderSchedulerService } from './reminder-scheduler.service';
import { GetQueueItemsOptions } from 'src/common/types/reminder.types';
import { QueryOptionsDto } from 'src/common/dto/query-options.dto';

@ApiTags('Reminders')
@Controller({ path: 'reminders', version: '1' })
export class ReminderController {
  constructor(
    private readonly service: ReminderService,
    private readonly scheduler: ReminderSchedulerService,
    private readonly triggerService: ReminderTriggerService,
  ) {}

  // ────────────────────────────────
  // REMINDER CONFIG
  // ────────────────────────────────
  @Post('configs')
  @ApiOperation({ summary: 'Create a new reminder configuration' })
  @ApiResponse({ status: 201, type: ReminderConfigResponseDto })
  async createConfig(@Body() dto: CreateReminderConfigDto) {
    return this.service.createConfig(dto);
  }

  @Get('configs')
  @ApiOperation({ summary: 'List all reminder configurations' })
  @ApiResponse({ status: 200, type: [ReminderConfigResponseDto] })
  async listConfigs() {
    return this.service.listConfigs();
  }

  @Get('configs/:id')
  @ApiOperation({ summary: 'Get a specific reminder configuration' })
  @ApiResponse({ status: 200, type: ReminderConfigResponseDto })
  async getConfig(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.getConfig(id);
  }

  @Patch('configs/:id')
  @ApiOperation({ summary: 'Update a reminder configuration' })
  @ApiResponse({ status: 200, type: ReminderConfigResponseDto })
  async updateConfig(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateReminderConfigDto,
  ) {
    return this.service.updateConfig(id, dto);
  }

  @Delete('configs/:id')
  @ApiOperation({ summary: 'Delete a reminder configuration' })
  @ApiResponse({ status: 200 })
  async deleteConfig(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.deleteConfig(id);
  }

  // ────────────────────────────────
  // REMINDER RECIPIENT
  // ────────────────────────────────
  @Post('recipients')
  @ApiOperation({ summary: 'Create a new reminder recipient' })
  @ApiResponse({ status: 201, type: ReminderRecipientResponseDto })
  async createRecipient(@Body() dto: CreateReminderRecipientDto) {
    return this.service.createRecipient(dto);
  }

  @Get('recipients')
  @ApiOperation({
    summary: 'List reminder recipients with filters & pagination',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Filter recipients by name or email (case-insensitive)',
    example: 'feedback@company.com',
  })
  @ApiQuery({
    name: 'skip',
    required: false,
    type: Number,
    example: 0,
  })
  @ApiQuery({
    name: 'take',
    required: false,
    type: Number,
    example: 20,
  })
  @ApiResponse({
    status: 200,
    description: 'Paginated reminder recipients retrieved successfully',
    type: PaginatedRecipientResponseDto,
  })
  async listRecipients(
    @Query() query: QueryOptionsDto,
  ): Promise<PaginatedRecipientResponseDto> {
    return this.service.listRecipients(query);
  }

  @Get('recipients/:id')
  @ApiOperation({ summary: 'Get a specific reminder recipient' })
  @ApiResponse({ status: 200, type: ReminderRecipientResponseDto })
  async getRecipient(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.getRecipient(id);
  }

  @Patch('recipients/:id')
  @ApiOperation({ summary: 'Update a reminder recipient' })
  @ApiResponse({ status: 200, type: ReminderRecipientResponseDto })
  async updateRecipient(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateReminderRecipientDto,
  ) {
    return this.service.updateRecipient(id, dto);
  }

  @Delete('recipients/:id')
  @ApiOperation({ summary: 'Delete a reminder recipient' })
  @ApiResponse({ status: 200 })
  async deleteRecipient(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.deleteRecipient(id);
  }

  // ────────────────────────────────
  // REMINDER QUEUE (ADMIN VIEW)
  // ────────────────────────────────
  @Get('queue')
  @ApiOperation({ summary: 'Get reminder queue items with filters' })
  @ApiResponse({
    status: 200,
    description: 'Queue items retrieved successfully',
    type: [ReminderQueueResponseDto],
  })
  async getQueue(@Query() query: GetQueueItemsDto) {
    const options: GetQueueItemsOptions = {
      status: query.status,
      fromDate: query.fromDate ? new Date(query.fromDate) : undefined,
      toDate: query.toDate ? new Date(query.toDate) : undefined,
      configId: query.configId,
      includeFailed: query.includeFailed,
    };

    return this.service.getQueueList(options);
  }

  @Delete('queue')
  @ApiOperation({ summary: 'Clear all items from the reminder queue' })
  @ApiResponse({
    status: 200,
    description: 'Queue cleared successfully',
  })
  async clearQueue() {
    return this.service.clearQueue();
  }

  // ────────────────────────────────
  // MANUAL RESCHEDULE ENDPOINT
  // ────────────────────────────────
  @Post('reschedule')
  @ApiOperation({ summary: 'Manually reschedule all document reminders' })
  @ApiResponse({
    status: 200,
    description: 'Rescheduling triggered',
  })
  async rescheduleAllDocuments() {
    await this.scheduler.rescheduleAllDocuments();
    return { success: true, message: 'Rescheduling triggered.' };
  }

  // ────────────────────────────────
  // MANUAL REMINDER TRIGGER
  // ────────────────────────────────
  @Post('trigger')
  @ApiOperation({ summary: 'Manually trigger reminder processing' })
  @ApiResponse({
    status: 200,
    description: 'Reminder processing triggered',
  })
  async triggerReminderProcessing(@Body() dto: TriggerReminderDto) {
    const result = await this.triggerService.processPendingReminders(
      dto.triggeredBy || 'manual:api',
      dto.preface || 'Manual trigger executed.',
    );

    return {
      success: result.ok,
      message: result.message,
    };
  }
}
