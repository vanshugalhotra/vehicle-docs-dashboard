import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { LoggerService, LogContext } from 'src/common/logger/logger.service';
import { ConfigService } from 'src/config/config.service';
import { Prisma, OtpPurpose } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class OtpService {
  private readonly entity = 'Otp';

  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly config: ConfigService,
  ) {}

  // ──────────────────────────────
  // GENERATE OTP
  // ──────────────────────────────
  async generate(email: string, purpose: OtpPurpose): Promise<{ otp: string }> {
    const ctx: LogContext = {
      entity: this.entity,
      action: 'generate',
      additional: { email, purpose },
    };

    this.logger.logInfo('Generating OTP', ctx);

    try {
      const otp = this.generateNumericOtp();
      const codeHash = await bcrypt.hash(otp, 10);

      const ttlMinutes =
        Number(this.config.get('OTP_EXPIRES_IN_MINUTES')) || 10;
      const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);

      await this.prisma.otp.create({
        data: {
          email,
          purpose,
          codeHash,
          expiresAt,
        },
      });

      this.logger.logInfo('OTP generated successfully', ctx);

      return { otp }; // Caller responsible for sending via email
    } catch (error) {
      this.logger.logError('Failed to generate OTP', ctx, error);

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new InternalServerErrorException('OTP persistence failed');
      }

      throw new InternalServerErrorException('Failed to generate OTP');
    }
  }

  // ──────────────────────────────
  // VERIFY OTP
  // ──────────────────────────────
  async verify(email: string, purpose: OtpPurpose, otp: string): Promise<void> {
    const ctx: LogContext = {
      entity: this.entity,
      action: 'verify',
      additional: { email, purpose },
    };

    try {
      const record = await this.prisma.otp.findFirst({
        where: {
          email,
          purpose,
          usedAt: null,
          expiresAt: { gt: new Date() },
        },
        orderBy: { createdAt: 'desc' },
      });

      if (!record) {
        this.logger.logWarn('OTP not found or expired', ctx);
        throw new BadRequestException('Invalid or expired OTP');
      }

      const isValid = await bcrypt.compare(otp, record.codeHash);

      if (!isValid) {
        this.logger.logWarn('OTP mismatch', ctx);
        throw new BadRequestException('Invalid or expired OTP');
      }

      await this.prisma.otp.update({
        where: { id: record.id },
        data: { usedAt: new Date() },
      });

      this.logger.logInfo('OTP verified successfully', ctx);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      this.logger.logError('OTP verification failed', ctx, error);
      throw new InternalServerErrorException('Failed to verify OTP');
    }
  }

  // ──────────────────────────────
  // HELPERS
  // ──────────────────────────────
  private generateNumericOtp(length = 6): string {
    const min = Math.pow(10, length - 1);
    const max = Math.pow(10, length) - 1;
    return Math.floor(min + Math.random() * (max - min + 1)).toString();
  }
}
