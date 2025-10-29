import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsString,
  IsIn,
  Min,
  MaxLength,
  IsBoolean,
} from 'class-validator';

/**
 * Unified query options DTO for pagination, search, sorting, and filtering.
 * Used across all list endpoints for consistent and predictable querying.
 */
export class QueryOptionsDto {
  @ApiPropertyOptional({
    description: 'Number of records to skip (for pagination)',
    example: 0,
    minimum: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  skip?: number = 0;

  @ApiPropertyOptional({
    description: 'Number of records to fetch (for pagination)',
    example: 20,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  take?: number = 20;

  @ApiPropertyOptional({
    description: 'Case-insensitive search term applied to searchable fields',
    example: 'Tesla',
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  search?: string;

  @ApiPropertyOptional({
    description: 'Field name to sort by (default: createdAt)',
    example: 'createdAt',
  })
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({
    description: 'Sort order direction',
    enum: ['asc', 'desc'],
    example: 'desc',
  })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  order?: 'asc' | 'desc' = 'desc';

  @ApiPropertyOptional({
    description:
      'Key-value filters as JSON string (e.g., {"categoryId": "cat-1"})',
    type: String,
    example: '{"categoryId": "cat-1", "typeId": "type-2"}',
  })
  @IsOptional()
  @IsString()
  @Type(() => Object)
  filters?: string;

  @ApiPropertyOptional({
    description: 'Include related entities',
    type: Boolean,
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  includeRelations?: boolean = true;
}
