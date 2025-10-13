import { ApiProperty } from '@nestjs/swagger';
import { TypeResponseDto } from 'src/modules/vehicle-type/dto/type-response.dto';

export class CategoryResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ type: [TypeResponseDto], required: false })
  types?: TypeResponseDto[];

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
