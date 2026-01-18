import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { Response } from 'express';

import { LoggerService, LogContext } from 'src/common/logger/logger.service';
import { ConfigService } from 'src/config/config.service';

import { UserService } from './user/user.service';
import { OtpService } from './otp/otp.service';
import { EmailService } from 'src/email/email.service';

import {
  LoginDto,
  RegisterRequestDto,
  VerifyRegistrationOtpDto,
  ForgotPasswordRequestDto,
  ResetPasswordDto,
} from './dto/auth.dto';
import { CreateUserDto } from './dto/create-user.dto';

import { generateJwt, verifyPassword } from 'src/common/utils/auth-utils';
import {
  getCookieOptions,
  clearAuthCookie,
} from 'src/common/utils/cookie-utils';

import { OtpPurpose } from '@prisma/client';
import {
  passwordResetOtpTemplate,
  registrationOtpTemplate,
} from 'src/email/templates';

@Injectable()
export class AuthService {
  private readonly entity = 'Auth';

  constructor(
    private readonly userService: UserService,
    private readonly otpService: OtpService,
    private readonly emailService: EmailService,
    private readonly config: ConfigService,
    private readonly logger: LoggerService,
  ) {}

  /* ──────────────────────────────
   * REGISTRATION – STEP 1
   * Request OTP
   * ────────────────────────────── */
  async requestRegistrationOtp(
    dto: RegisterRequestDto,
  ): Promise<{ success: true }> {
    const ctx: LogContext = {
      entity: this.entity,
      action: 'requestRegistrationOtp',
      additional: { email: dto.email },
    };

    this.logger.logInfo('Requesting registration OTP', ctx);

    const existing = await this.userService.findByEmail(dto.email);
    if (existing) {
      this.logger.logWarn('Email already registered', ctx);
      throw new ConflictException('Email already registered');
    }

    const { otp } = await this.otpService.generate(
      dto.email,
      OtpPurpose.REGISTRATION,
    );

    const expiresInMinutes =
      Number(this.config.get('OTP_EXPIRES_IN_MINUTES')) || 10;

    const html = registrationOtpTemplate({
      otp,
      expiresInMinutes,
    });

    await this.emailService.sendEmail([dto.email], 'Verify your email', html);

    this.logger.logInfo('Registration OTP sent', ctx);
    return { success: true };
  }

  /* ──────────────────────────────
   * REGISTRATION – STEP 2
   * Verify OTP + Create User
   * ────────────────────────────── */
  async verifyRegistrationOtp(
    dto: VerifyRegistrationOtpDto & RegisterRequestDto,
    res: Response,
  ) {
    const ctx: LogContext = {
      entity: this.entity,
      action: 'verifyRegistrationOtp',
      additional: { email: dto.email },
    };

    this.logger.logInfo('Verifying registration OTP', ctx);

    await this.otpService.verify(dto.email, OtpPurpose.REGISTRATION, dto.otp);

    const createUserDto: CreateUserDto = {
      fullName: dto.fullName,
      mobile: dto.mobile,
      email: dto.email,
      password: dto.password,
    };

    const user = await this.userService.create(createUserDto);

    const token = generateJwt({ id: user.id, email: user.email }, this.config);

    res.cookie(
      this.config.get('AUTH_COOKIE_NAME'),
      token,
      getCookieOptions(this.config),
    );

    this.logger.logInfo('User registered successfully', {
      ...ctx,
      additional: { userId: user.id },
    });

    return user;
  }

  /* ──────────────────────────────
   * PASSWORD RESET
   * ────────────────────────────── */
  async requestPasswordResetOtp(
    dto: ForgotPasswordRequestDto,
  ): Promise<{ success: true }> {
    const ctx: LogContext = {
      entity: this.entity,
      action: 'requestPasswordResetOtp',
      additional: { email: dto.email },
    };

    this.logger.logInfo('Requesting password reset OTP', ctx);

    const user = await this.userService.findByEmail(dto.email);
    if (!user) {
      // do NOT leak existence
      this.logger.logWarn(
        'Password reset requested for non-existing email',
        ctx,
      );
      return { success: true };
    }

    const { otp } = await this.otpService.generate(
      dto.email,
      OtpPurpose.PASSWORD_RESET,
    );

    const expiresInMinutes =
      Number(this.config.get('OTP_EXPIRES_IN_MINUTES')) || 10;

    const html = passwordResetOtpTemplate({
      otp,
      expiresInMinutes,
    });

    await this.emailService.sendEmail([dto.email], 'Reset your password', html);

    this.logger.logInfo('Password reset OTP sent', ctx);
    return { success: true };
  }

  async resetPassword(dto: ResetPasswordDto): Promise<{ success: true }> {
    const ctx: LogContext = {
      entity: this.entity,
      action: 'resetPassword',
      additional: { email: dto.email },
    };

    this.logger.logInfo('Resetting password', ctx);

    await this.otpService.verify(dto.email, OtpPurpose.PASSWORD_RESET, dto.otp);

    await this.userService.updatePassword(dto.email, dto.password);

    this.logger.logInfo('Password reset successful', ctx);
    return { success: true };
  }

  /* ──────────────────────────────
   * LOGIN
   * ────────────────────────────── */
  async login(dto: LoginDto, res: Response) {
    const ctx: LogContext = {
      entity: this.entity,
      action: 'login',
      additional: { email: dto.email },
    };

    this.logger.logInfo('Login attempt', ctx);

    const user = await this.userService.findByEmail(dto.email);
    if (!user) {
      this.logger.logWarn('User not found', ctx);
      throw new UnauthorizedException('Invalid credentials');
    }

    const valid = await verifyPassword(dto.password, user.passwordHash);
    if (!valid) {
      this.logger.logWarn('Invalid password', ctx);
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = generateJwt({ id: user.id, email: user.email }, this.config);

    res.cookie(
      this.config.get('AUTH_COOKIE_NAME'),
      token,
      getCookieOptions(this.config),
    );

    this.logger.logInfo('Login successful', {
      ...ctx,
      additional: { userId: user.id },
    });

    return user;
  }

  /* ──────────────────────────────
   * LOGOUT
   * ────────────────────────────── */
  logout(res: Response, userId?: string) {
    const ctx: LogContext = {
      entity: this.entity,
      action: 'logout',
      additional: { userId },
    };

    clearAuthCookie(res, this.config);
    this.logger.logInfo('Logout successful', ctx);

    return { success: true };
  }

  /* ──────────────────────────────
   * ME
   * ────────────────────────────── */
  async me(userId: string) {
    return this.userService.findOne(userId);
  }
}
