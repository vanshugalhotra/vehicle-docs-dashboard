import {
  Controller,
  Get,
  Param,
  Delete,
  Patch,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { AdminSecretGuard } from '../auth.gaurd';
import { OtpAdminService } from './otp-admin.service';
import { OtpResponseDto } from './dto/otp-response.dto';

@UseGuards(AdminSecretGuard)
@Controller({ path: 'otps', version: '1' })
export class OtpAdminController {
  constructor(private readonly otpAdminService: OtpAdminService) {}

  // ──────────────────────────────
  // READ ALL
  // ──────────────────────────────
  @Get()
  async findAll(): Promise<OtpResponseDto[]> {
    return this.otpAdminService.findAll();
  }

  // ──────────────────────────────
  // READ ONE
  // ──────────────────────────────
  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<OtpResponseDto> {
    return this.otpAdminService.findOne(id);
  }

  // ──────────────────────────────
  // MARK USED
  // ──────────────────────────────
  @Patch(':id/mark-used')
  async markUsed(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<OtpResponseDto> {
    return this.otpAdminService.markUsed(id);
  }

  // ──────────────────────────────
  // DELETE
  // ──────────────────────────────
  @Delete(':id')
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{ success: boolean }> {
    return this.otpAdminService.remove(id);
  }

  // ──────────────────────────────
  // DELETE EXPIRED (ADMIN TOOL)
  // ──────────────────────────────
  @Delete('cleanup/expired')
  async cleanupExpired(): Promise<{ deletedCount: number }> {
    return this.otpAdminService.removeExpired();
  }
}
