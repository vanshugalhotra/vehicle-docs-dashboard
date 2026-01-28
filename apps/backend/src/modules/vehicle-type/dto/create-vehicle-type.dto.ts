import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, MaxLength, IsUUID } from 'class-validator';
import { NoEmoji } from 'src/common/decorators/noemoji.decorator';
import { Trim } from 'src/common/decorators/trim.decorator';

export class CreateVehicleTypeDto {
  @ApiProperty({ description: 'Name of the vehicle type', example: 'SUV' })
  @IsString()
  @MinLength(2, { message: 'Vehicle type name must be at least 2 characters.' })
  @MaxLength(50, {
    message: 'Vehicle type name must be at most 50 characters.',
  })
  @NoEmoji()
  @Trim()
  name: string;

  @ApiProperty({
    description: 'ID of the parent category',
    example: 'cat-uuid',
  })
  @IsUUID('4', { message: 'categoryId must be a valid UUID.' })
  categoryId: string;
}
