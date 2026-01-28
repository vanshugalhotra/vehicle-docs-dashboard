import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, MaxLength } from 'class-validator';
import { NoEmoji } from 'src/common/decorators/noemoji.decorator';
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
  @NoEmoji()
  @Trim()
  name: string;
}
