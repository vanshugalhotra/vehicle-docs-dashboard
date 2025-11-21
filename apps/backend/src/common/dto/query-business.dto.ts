import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';
import { QueryOptionsDto } from './query-options.dto';

/**
 * Extends QueryOptionsDto with business-level filters.
 * This is used by all list endpoints that support business rules
 * (vehicles, vehicle-documents, etc.).
 */
export class QueryWithBusinessDto extends QueryOptionsDto {
  @ApiPropertyOptional({
    description:
      'Business-level filters as JSON string. Applied after base DB filters.\n' +
      'Example: {"unassigned": true, "docStatus": "expired"}',
    type: String,
    example: '{"unassigned": true}',
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  businessFilters?: string;
}
