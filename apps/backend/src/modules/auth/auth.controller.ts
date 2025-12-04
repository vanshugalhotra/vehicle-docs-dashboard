import {
  Controller,
  Post,
  Body,
  Res,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiResponse, ApiHeader } from '@nestjs/swagger';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { CreateUserDto, LoginDto, UserResponseDto } from './dto/auth.dto';
import { AdminSecretGuard, AuthGuard } from './auth.gaurd';

@ApiTags('Auth')
@Controller({ path: 'auth', version: '1' })
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // ──────────────────────────────
  // LOGIN
  // ──────────────────────────────
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Invalid email or password' })
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.login(dto, res);
  }

  // ──────────────────────────────
  // CREATE USER
  // ──────────────────────────────
  @Post('create-user')
  @UseGuards(AdminSecretGuard)
  @ApiHeader({
    name: 'x-admin-secret',
    description: 'Admin secret header',
    required: true,
  })
  @ApiResponse({
    status: 201,
    description: 'User created',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 409, description: 'User already exists' })
  async createUser(@Body() dto: CreateUserDto): Promise<UserResponseDto> {
    return this.authService.createUser(dto);
  }

  // ──────────────────────────────
  // LOGOUT
  // ──────────────────────────────
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  @ApiResponse({ status: 200, description: 'Logout successful' })
  logout(
    @Res({ passthrough: true }) res: Response,
    @Body('userId') userId: string,
  ) {
    return this.authService.logout(res, userId);
  }
}
