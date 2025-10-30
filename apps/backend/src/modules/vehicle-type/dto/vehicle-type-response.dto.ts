import { ApiProperty } from '@nestjs/swagger';

export class TypeResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  categoryId: string; // FK reference, no full category object to avoid circular nesting

  @ApiProperty()
  createdAt: string | Date;

  @ApiProperty()
  updatedAt: string | Date;
}

export class PaginatedTypeResponseDto {
  @ApiProperty({ type: [TypeResponseDto] })
  items: TypeResponseDto[];

  @ApiProperty({ example: 150 })
  total: number;
}
