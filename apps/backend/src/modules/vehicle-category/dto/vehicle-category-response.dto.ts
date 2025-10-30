import { ApiProperty } from '@nestjs/swagger';
import { TypeResponseDto } from 'src/modules/vehicle-type/dto/vehicle-type-response.dto';

export class CategoryResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ type: [TypeResponseDto], required: false })
  types?: TypeResponseDto[];

  @ApiProperty()
  createdAt: string | Date;

  @ApiProperty()
  updatedAt: string | Date;
}

export class PaginatedCategoryResponseDto {
  @ApiProperty({ type: [CategoryResponseDto] })
  items: CategoryResponseDto[];

  @ApiProperty({ example: 150 })
  total: number;
}
