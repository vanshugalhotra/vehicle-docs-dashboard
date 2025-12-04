import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { LoggerService, LogContext } from 'src/common/logger/logger.service';
import { handlePrismaError } from 'src/common/utils/prisma-error-handler';
import {
  verifyPassword,
  hashPassword,
  generateJwt,
  verifyJwt,
} from 'src/common/utils/auth-utils';
import {
  getCookieOptions,
  clearAuthCookie,
} from 'src/common/utils/cookie-utils';
import { Response } from 'express';
import { ConfigService } from 'src/config/config.service';
import { Prisma } from '@prisma/client';
import { CreateUserDto, LoginDto, UserResponseDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  private readonly entity = 'Auth';

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly logger: LoggerService,
  ) {}

  /**
   * Validate user credentials
   */
  async validateUser(email: string, password: string) {
    const ctx: LogContext = {
      entity: this.entity,
      action: 'validateUser',
      additional: { email },
    };

    this.logger.logDebug(`Validating user credentials`, ctx);

    try {
      const user = await this.prisma.user.findUnique({ where: { email } });

      if (!user) {
        this.logger.logWarn(`Validation failed - user not found`, ctx);
        return null;
      }

      const match = await verifyPassword(password, user.passwordHash);

      if (!match) {
        this.logger.logWarn(`Validation failed - wrong password`, ctx);
        return null;
      }

      return user;
    } catch (error) {
      this.logger.logError('Error validating user credentials', {
        ...ctx,
        additional: { error },
      });

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        handlePrismaError(error, this.entity);
      }

      // Return null on validation error rather than throwing
      // This allows the caller to handle authentication failure gracefully
      return null;
    }
  }

  /**
   * Create new user
   */
  async createUser(dto: CreateUserDto): Promise<UserResponseDto> {
    const ctx: LogContext = {
      entity: this.entity,
      action: 'createUser',
      additional: { email: dto.email },
    };

    this.logger.logInfo(`Creating new user`, ctx);

    try {
      // Check for existing user
      const existingUser = await this.prisma.user.findUnique({
        where: { email: dto.email },
      });

      if (existingUser) {
        this.logger.logWarn(`User already exists`, ctx);
        throw new ConflictException(`User with this email already exists`);
      }

      const passwordHash = await hashPassword(dto.password);

      const user = await this.prisma.user.create({
        data: { email: dto.email, passwordHash },
      });

      this.logger.logInfo(`User successfully created`, {
        ...ctx,
        additional: { userId: user.id },
      });

      return user as UserResponseDto;
    } catch (error) {
      this.logger.logError('Error creating user', {
        ...ctx,
        additional: { error },
      });

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        handlePrismaError(error, this.entity);
      }

      // Re-throw conflict exception
      if (error instanceof ConflictException) {
        throw error;
      }

      // Wrap other errors
      throw new InternalServerErrorException('Failed to create user');
    }
  }

  /**
   * Login user + set JWT cookie
   */
  async login(dto: LoginDto, res: Response): Promise<UserResponseDto> {
    const ctx: LogContext = {
      entity: this.entity,
      action: 'login',
      additional: { email: dto.email },
    };

    this.logger.logInfo(`User login attempt`, ctx);

    try {
      const user = await this.validateUser(dto.email, dto.password);

      if (!user) {
        this.logger.logWarn(`Login failed`, ctx);
        throw new UnauthorizedException('Invalid email or password');
      }

      const jwtUser: { id: string; email: string } = {
        id: user.id,
        email: user.email,
      };

      const token = generateJwt(jwtUser, this.config);

      res.cookie(
        this.config.get('AUTH_COOKIE_NAME'),
        token,
        getCookieOptions(this.config),
      );

      this.logger.logInfo(`Login successful`, {
        ...ctx,
        additional: { userId: user.id },
      });

      return user as UserResponseDto;
    } catch (error) {
      this.logger.logError('Error during login', {
        ...ctx,
        additional: { error },
      });

      if (error instanceof UnauthorizedException) {
        throw error; // Re-throw auth errors
      }

      // Wrap other errors
      throw new InternalServerErrorException(
        'Login failed due to server error',
      );
    }
  }

  /**
   * Logout (clear cookie)
   */
  logout(res: Response, userId: string) {
    const ctx: LogContext = {
      entity: this.entity,
      action: 'logout',
      additional: { userId },
    };

    this.logger.logInfo(`User logout attempt`, ctx);

    try {
      clearAuthCookie(res, this.config);

      this.logger.logInfo(`Logout successful`, ctx);

      return { success: true };
    } catch (error) {
      this.logger.logError('Error during logout', {
        ...ctx,
        additional: { error },
      });

      // Even if clearing cookie fails, we can still return success
      // as the token will expire anyway
      return { success: true };
    }
  }

  /**
   * Verify JWT token
   */
  verifyToken(token: string): ReturnType<typeof verifyJwt> {
    const ctx: LogContext = {
      entity: this.entity,
      action: 'verifyToken',
      additional: { tokenLength: token?.length },
    };

    this.logger.logDebug(`Verifying JWT token`, ctx);

    try {
      const result = verifyJwt(token, this.config);

      this.logger.logDebug(`Token verification successful`, {
        ...ctx,
        additional: { sub: result.sub },
      });

      return result;
    } catch (error) {
      this.logger.logError('Token verification failed', {
        ...ctx,
        additional: { error },
      });

      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
