import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { Trim } from 'src/common/decorators/trim.decorator';

export class CreateUserDto {
  @IsString()
  @IsOptional()
  @Trim()
  fullName: string;

  @IsString()
  @IsOptional()
  @Trim()
  mobile: string;

  @IsEmail()
  @IsNotEmpty()
  @Trim()
  email: string;

  @IsNotEmpty()
  @MinLength(6)
  password: string;
}
