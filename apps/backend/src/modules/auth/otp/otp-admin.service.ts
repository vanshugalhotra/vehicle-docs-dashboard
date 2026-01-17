import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { OtpResponseDto } from './dto/otp-response.dto';

@Injectable()
export class OtpAdminService {
  constructor(private readonly prisma: PrismaService) {}

  // ──────────────────────────────
  // READ ALL
  // ──────────────────────────────
  async findAll(): Promise<OtpResponseDto[]> {
    return this.prisma.otp.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  // ──────────────────────────────
  // READ ONE
  // ──────────────────────────────
  async findOne(id: string): Promise<OtpResponseDto> {
    const otp = await this.prisma.otp.findUnique({ where: { id } });

    if (!otp) {
      throw new NotFoundException('OTP not found');
    }

    return otp;
  }

  // ──────────────────────────────
  // MARK AS USED (ADMIN OVERRIDE)
  // ──────────────────────────────
  async markUsed(id: string): Promise<OtpResponseDto> {
    const otp = await this.prisma.otp.findUnique({ where: { id } });

    if (!otp) {
      throw new NotFoundException('OTP not found');
    }

    return this.prisma.otp.update({
      where: { id },
      data: { usedAt: new Date() },
    });
  }

  // ──────────────────────────────
  // DELETE
  // ──────────────────────────────
  async remove(id: string): Promise<{ success: boolean }> {
    await this.prisma.otp.delete({
      where: { id },
    });

    return { success: true };
  }

  // ──────────────────────────────
  // DELETE EXPIRED
  // ──────────────────────────────
  async removeExpired(): Promise<{ deletedCount: number }> {
    const { count } = await this.prisma.otp.deleteMany({
      where: {
        expiresAt: { lt: new Date() },
      },
    });

    return { deletedCount: count };
  }
}
