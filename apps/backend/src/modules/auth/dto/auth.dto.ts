import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import { Trim } from 'src/common/decorators/trim.decorator';

export class LoginDto {
  @ApiProperty({ example: 'admin@example.com' })
  @IsEmail()
  @Trim()
  email: string;

  @ApiProperty({ example: 'P@ssw0rd123!' })
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}

export class CreateUserDto {
  @ApiProperty({ example: 'newadmin@example.com' })
  @IsEmail()
  @Trim()
  email: string;

  @ApiProperty({ example: 'StrongP@ssword123!' })
  @IsNotEmpty()
  @MinLength(10, { message: 'Password must be at least 10 characters' })
  password: string;
}

export class UserResponseDto {
  @ApiProperty({ example: 'c025adcc-2357-4761-8c33-32145e62e43f' })
  id: string;

  @ApiProperty({ example: 'admin@example.com' })
  email: string;

  @ApiProperty({ example: '2025-01-10T05:21:22Z' })
  createdAt?: Date;

  @ApiProperty({ example: '2025-01-10T05:21:22Z' })
  updatedAt?: Date;
}
