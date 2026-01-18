import {
  Controller,
  Get,
  Param,
  Query,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { AuditQueryService } from './audit-query.service';
import {
  AuditLogResponseDto,
  PaginatedAuditLogResponseDto,
} from './dto/audit-response.dto';
import { QueryOptionsDto } from 'src/common/dto/query-options.dto';
import { AuthGuard } from '../auth/auth.gaurd';
import { AuditEntity } from 'src/common/types/audit.types';

@ApiTags('Audit Logs')
@UseGuards(AuthGuard)
@Controller({ path: 'audit-logs', version: '1' })
export class AuditController {
  constructor(private readonly auditQueryService: AuditQueryService) {}

  // ────────────────────────────────────────────────
  // GLOBAL AUDIT LOG
  // GET /audit-logs
  // ────────────────────────────────────────────────
  @Get()
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search audit logs by summary (case-insensitive)',
    example: 'renewed',
  })
  @ApiResponse({
    status: 200,
    description: 'Global audit log fetched successfully',
    type: PaginatedAuditLogResponseDto,
  })
  async listAll(
    @Query() query: QueryOptionsDto,
  ): Promise<PaginatedAuditLogResponseDto> {
    return this.auditQueryService.listAuditLogs(query);
  }

  // ────────────────────────────────────────────────
  // ENTITY-SPECIFIC AUDIT LOG
  // GET /audit-logs/entity/:entityType/:entityId
  // ────────────────────────────────────────────────
  @Get('entity/:entityType/:entityId')
  @ApiResponse({
    status: 200,
    description: 'Entity audit log fetched successfully',
    type: PaginatedAuditLogResponseDto,
  })
  async listForEntity(
    @Param('entityType') entityType: AuditEntity,
    @Param('entityId', ParseUUIDPipe) entityId: string,
    @Query() query: QueryOptionsDto,
  ): Promise<PaginatedAuditLogResponseDto> {
    let parsedFilters: Record<string, unknown> = {};

    if (typeof query.filters === 'string' && query.filters.trim().length > 0) {
      parsedFilters = JSON.parse(query.filters) as Record<string, unknown>;
    }

    const mergedFilters = {
      ...parsedFilters,
      entityType,
      entityId,
    };

    return this.auditQueryService.listAuditLogs({
      ...query,
      filters: JSON.stringify(mergedFilters),
    });
  }

  // ────────────────────────────────────────────────
  // SINGLE AUDIT LOG
  // GET /audit-logs/:id
  // ────────────────────────────────────────────────
  @Get(':id')
  @ApiResponse({
    status: 200,
    description: 'Audit log fetched successfully',
    type: AuditLogResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Audit log not found',
  })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<AuditLogResponseDto> {
    return this.auditQueryService.getAuditLogById(id);
  }
}
