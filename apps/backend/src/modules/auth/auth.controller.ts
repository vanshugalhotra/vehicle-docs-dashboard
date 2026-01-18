import {
  Controller,
  Post,
  Body,
  Res,
  Req,
  UseGuards,
  Get,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Response, Request } from 'express';

import { AuthService } from './auth.service';
import {
  LoginDto,
  RegisterRequestDto,
  VerifyRegistrationOtpDto,
  ForgotPasswordRequestDto,
  ResetPasswordDto,
} from './dto/auth.dto';

import { AuthGuard } from './auth.gaurd';

@Controller({ path: 'auth', version: '1' })
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // ──────────────────────────────
  // REGISTRATION – STEP 1
  // Request OTP
  // ──────────────────────────────
  @Post('register/request-otp')
  @HttpCode(HttpStatus.OK)
  async requestRegistrationOtp(
    @Body() dto: RegisterRequestDto,
  ): Promise<{ success: true }> {
    return this.authService.requestRegistrationOtp(dto);
  }

  // ──────────────────────────────
  // REGISTRATION – STEP 2
  // Verify OTP + Create User
  // ──────────────────────────────
  @Post('register/verify-otp')
  @HttpCode(HttpStatus.CREATED)
  async verifyRegistrationOtp(
    @Body() dto: VerifyRegistrationOtpDto & RegisterRequestDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.verifyRegistrationOtp(dto, res);
  }

  // ──────────────────────────────
  // FORGOT PASSWORD – STEP 1
  // Request OTP
  // ──────────────────────────────
  @Post('forgot-password/request-otp')
  @HttpCode(HttpStatus.OK)
  async requestPasswordResetOtp(
    @Body() dto: ForgotPasswordRequestDto,
  ): Promise<{ success: true }> {
    return this.authService.requestPasswordResetOtp(dto);
  }

  // ──────────────────────────────
  // FORGOT PASSWORD – STEP 2
  // Verify OTP + Reset Password
  // ──────────────────────────────
  @Post('forgot-password/reset')
  @HttpCode(HttpStatus.OK)
  async resetPassword(
    @Body() dto: ResetPasswordDto,
  ): Promise<{ success: true }> {
    return this.authService.resetPassword(dto);
  }

  // ──────────────────────────────
  // LOGIN
  // ──────────────────────────────
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.login(dto, res);
  }

  // ──────────────────────────────
  // LOGOUT
  // ──────────────────────────────
  @Post('logout')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  logout(
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request & { user?: { sub: string } },
  ) {
    return this.authService.logout(res, req.user?.sub);
  }

  // ──────────────────────────────
  // ME
  // ──────────────────────────────
  @Get('me')
  @UseGuards(AuthGuard)
  async me(@Req() req: Request & { user: { sub: string } }) {
    return this.authService.me(req.user.sub);
  }
}
