import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength, MaxLength } from 'class-validator';
import { NoEmoji } from 'src/common/decorators/noemoji.decorator';
import { Trim } from 'src/common/decorators/trim.decorator';

export class CreateOwnerDto {
  @ApiProperty({
    description: 'Unique name of the vehicle owner',
    example: 'Ustaad JI',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(50, {
    message: 'Owner name must be at most 50 characters.',
  })
  @NoEmoji()
  @Trim()
  name: string;
}
