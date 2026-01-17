import {
  Injectable,
  ConflictException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { LoggerService, LogContext } from 'src/common/logger/logger.service';
import { Prisma } from '@prisma/client';
import { handlePrismaError } from 'src/common/utils/prisma-error-handler';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import {
  PrivateUserResponseDto,
  UserResponseDto,
} from '../dto/user-response.dto';
import { hashPassword } from 'src/common/utils/auth-utils';

@Injectable()
export class UserService {
  private readonly entity = 'User';

  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
  ) {}

  // ──────────────────────────────
  // CREATE USER
  // ──────────────────────────────
  async create(dto: CreateUserDto): Promise<UserResponseDto> {
    const ctx: LogContext = {
      entity: this.entity,
      action: 'create',
      additional: { email: dto.email },
    };

    this.logger.logInfo('Creating user', ctx);

    try {
      // Enforce uniqueness (email)
      const existing = await this.prisma.user.findUnique({
        where: { email: dto.email },
      });

      if (existing) {
        this.logger.logWarn('User already exists', ctx);
        throw new ConflictException('User with this email already exists');
      }

      const passwordHash = await hashPassword(dto.password);

      const user = await this.prisma.user.create({
        data: {
          fullName: dto.fullName,
          mobile: dto.mobile,
          email: dto.email,
          passwordHash,
        },
      });

      this.logger.logInfo('User created successfully', {
        ...ctx,
        additional: { userId: user.id },
      });

      return user as UserResponseDto;
    } catch (error) {
      this.logger.logError('Error creating user', {
        ...ctx,
        additional: { error },
      });

      if (error instanceof ConflictException) throw error;
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        handlePrismaError(error, this.entity);
      }

      throw new InternalServerErrorException('Failed to create user');
    }
  }

  // ──────────────────────────────
  // FIND ALL USERS
  // ──────────────────────────────
  async findAll(): Promise<UserResponseDto[]> {
    const ctx: LogContext = {
      entity: this.entity,
      action: 'findAll',
    };

    this.logger.logDebug('Fetching all users', ctx);

    try {
      const users = await this.prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
      });

      this.logger.logInfo('Users fetched', {
        ...ctx,
        additional: { count: users.length },
      });

      return users as UserResponseDto[];
    } catch (error) {
      this.logger.logError('Error fetching users', {
        ...ctx,
        additional: { error },
      });

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        handlePrismaError(error, this.entity);
      }

      throw new InternalServerErrorException('Failed to fetch users');
    }
  }

  // ──────────────────────────────
  // FIND ONE USER
  // ──────────────────────────────
  async findOne(id: string): Promise<UserResponseDto> {
    const ctx: LogContext = {
      entity: this.entity,
      action: 'findOne',
      additional: { id },
    };

    this.logger.logInfo('Fetching user by id', ctx);

    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
      });

      if (!user) {
        this.logger.logWarn('User not found', ctx);
        throw new NotFoundException(`User with id ${id} not found`);
      }

      return user as UserResponseDto;
    } catch (error) {
      this.logger.logError('Error fetching user', {
        ...ctx,
        additional: { error },
      });

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        handlePrismaError(error, this.entity);
      }

      throw error;
    }
  }

  // ──────────────────────────────
  // FIND USER BY EMAIL
  // ──────────────────────────────
  async findByEmail(email: string): Promise<PrivateUserResponseDto | null> {
    const ctx: LogContext = {
      entity: this.entity,
      action: 'findByEmail',
      additional: { email },
    };

    this.logger.logDebug('Fetching user by email', ctx);

    try {
      const user = await this.prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        this.logger.logWarn('User not found by email', ctx);
        return null;
      }

      this.logger.logDebug('User found by email', {
        ...ctx,
        additional: { userId: user.id },
      });

      return user as PrivateUserResponseDto;
    } catch (error) {
      this.logger.logError('Error fetching user by email', {
        ...ctx,
        additional: { error },
      });

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        handlePrismaError(error, this.entity);
      }

      throw new InternalServerErrorException('Failed to fetch user by email');
    }
  }

  // ──────────────────────────────
  // UPDATE USER
  // ──────────────────────────────
  async update(id: string, dto: UpdateUserDto): Promise<UserResponseDto> {
    const ctx: LogContext = {
      entity: this.entity,
      action: 'update',
      additional: { id },
    };

    this.logger.logInfo('Updating user', ctx);

    try {
      const existing = await this.prisma.user.findUnique({
        where: { id },
      });

      if (!existing) {
        this.logger.logWarn('Update failed, user not found', ctx);
        throw new NotFoundException(`User with id ${id} not found`);
      }

      // Email uniqueness check if email is being updated
      if (dto.email && dto.email !== existing.email) {
        const emailTaken = await this.prisma.user.findUnique({
          where: { email: dto.email },
        });

        if (emailTaken) {
          throw new ConflictException('Email already in use');
        }
      }

      const updated = await this.prisma.user.update({
        where: { id },
        data: {
          fullName: dto.fullName ?? existing.fullName,
          mobile: dto.mobile ?? existing.mobile,
          email: dto.email ?? existing.email,
          ...(dto.password
            ? { passwordHash: await hashPassword(dto.password) }
            : {}),
        },
      });

      this.logger.logInfo('User updated', {
        ...ctx,
        additional: { updatedId: updated.id },
      });

      return updated as UserResponseDto;
    } catch (error) {
      this.logger.logError('Error updating user', {
        ...ctx,
        additional: { error },
      });

      if (error instanceof ConflictException) throw error;
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        handlePrismaError(error, this.entity);
      }

      throw new InternalServerErrorException('Failed to update user');
    }
  }

  // ──────────────────────────────
  // DELETE USER
  // ──────────────────────────────
  async remove(id: string): Promise<{ success: boolean }> {
    const ctx: LogContext = {
      entity: this.entity,
      action: 'remove',
      additional: { id },
    };

    this.logger.logInfo('Deleting user', ctx);

    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
      });

      if (!user) {
        this.logger.logWarn('Delete failed, user not found', ctx);
        throw new NotFoundException(`User with id ${id} not found`);
      }

      await this.prisma.user.delete({ where: { id } });

      this.logger.logInfo('User deleted', {
        ...ctx,
        additional: { deletedId: id },
      });

      return { success: true };
    } catch (error) {
      this.logger.logError('Error deleting user', {
        ...ctx,
        additional: { error },
      });

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        handlePrismaError(error, this.entity);
      }

      throw new InternalServerErrorException('Failed to delete user');
    }
  }

  async updatePassword(email: string, password: string): Promise<void> {
    const passwordHash = await hashPassword(password);

    await this.prisma.user.update({
      where: { email },
      data: { passwordHash },
    });
  }
}
