import { ApiProperty } from '@nestjs/swagger';

export class TypeResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  categoryId: string; // FK reference, no full category object to avoid circular nesting

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
