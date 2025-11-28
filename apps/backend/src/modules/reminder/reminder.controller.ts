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
import { ApiTags, ApiResponse } from '@nestjs/swagger';
import { ReminderService } from './reminder.service';
import {
  CreateReminderConfigDto,
  CreateReminderRecipientDto,
} from './dto/create-reminder.dto';

import {
  UpdateReminderConfigDto,
  UpdateReminderRecipientDto,
} from './dto/update-reminder.dto';

import {
  ReminderConfigResponseDto,
  ReminderQueueResponseDto,
  ReminderRecipientResponseDto,
} from './dto/reminder-response.dto';

@ApiTags('Reminders')
@Controller({ path: 'reminders', version: '1' })
export class ReminderController {
  constructor(private readonly service: ReminderService) {}

  // ────────────────────────────────
  // REMINDER CONFIG
  // ────────────────────────────────
  @Post('configs')
  @ApiResponse({ status: 201, type: ReminderConfigResponseDto })
  async createConfig(@Body() dto: CreateReminderConfigDto) {
    return this.service.createConfig(dto);
  }

  @Get('configs')
  @ApiResponse({ status: 200, type: [ReminderConfigResponseDto] })
  async listConfigs() {
    return this.service.listConfigs();
  }

  @Get('configs/:id')
  @ApiResponse({ status: 200, type: ReminderConfigResponseDto })
  async getConfig(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.getConfig(id);
  }

  @Patch('configs/:id')
  @ApiResponse({ status: 200, type: ReminderConfigResponseDto })
  async updateConfig(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateReminderConfigDto,
  ) {
    return this.service.updateConfig(id, dto);
  }

  @Delete('configs/:id')
  @ApiResponse({ status: 200 })
  async deleteConfig(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.deleteConfig(id);
  }

  // ────────────────────────────────
  // REMINDER RECIPIENT
  // ────────────────────────────────
  @Post('recipients')
  @ApiResponse({ status: 201, type: ReminderRecipientResponseDto })
  async createRecipient(@Body() dto: CreateReminderRecipientDto) {
    return this.service.createRecipient(dto);
  }

  @Get('recipients')
  @ApiResponse({ status: 200, type: [ReminderRecipientResponseDto] })
  async listRecipients() {
    return this.service.listRecipients();
  }

  @Get('recipients/:id')
  @ApiResponse({ status: 200, type: ReminderRecipientResponseDto })
  async getRecipient(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.getRecipient(id);
  }

  @Patch('recipients/:id')
  @ApiResponse({ status: 200, type: ReminderRecipientResponseDto })
  async updateRecipient(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateReminderRecipientDto,
  ) {
    return this.service.updateRecipient(id, dto);
  }

  @Delete('recipients/:id')
  @ApiResponse({ status: 200 })
  async deleteRecipient(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.deleteRecipient(id);
  }

  // ────────────────────────────────
  // REMINDER QUEUE (ADMIN VIEW)
  // ────────────────────────────────
  @Get('queue')
  @ApiResponse({ status: 200, type: [ReminderQueueResponseDto] })
  async getQueue(@Query('days') days?: number) {
    return this.service.getQueueList({ days });
  }
}
