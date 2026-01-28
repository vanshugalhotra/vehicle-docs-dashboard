import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { NoEmoji } from 'src/common/decorators/noemoji.decorator';
import { Trim } from 'src/common/decorators/trim.decorator';

export class CreateUserDto {
  @IsString()
  @IsOptional()
  @Trim()
  @NoEmoji()
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
