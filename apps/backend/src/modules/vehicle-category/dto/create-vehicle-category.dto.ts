import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, MaxLength, Matches } from 'class-validator';
import { Trim } from 'src/common/decorators/trim.decorator';

export class CreateCategoryDto {
  @ApiProperty({ description: 'Name of the vehicle category', example: 'Car' })
  @IsString()
  @MinLength(2, {
    message: 'Category name must be at least 2 characters long.',
  })
  @MaxLength(50, {
    message: 'Category name must be at most 50 characters long.',
  })
  @Matches(/^[A-Za-z0-9\s-]+$/, {
    message:
      'Category name can only contain letters, numbers, spaces, and hyphens.',
  })
  @Trim()
  name: string;
}
