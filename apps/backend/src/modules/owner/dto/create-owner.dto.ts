import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  MinLength,
  Matches,
  MaxLength,
} from 'class-validator';

export class CreateOwnerDto {
  @ApiProperty({
    description: 'Unique name of the vehicle owner',
    example: 'Ustaad JI',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[A-Za-z0-9\s-]+$/, {
    message:
      'Owner name can only contain letters, numbers, spaces, and hyphens.',
  })
  @MinLength(2)
  @MaxLength(50, {
    message: 'Owner name must be at most 50 characters.',
  })
  name: string;
}
