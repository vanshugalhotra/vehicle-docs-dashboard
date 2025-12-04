import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  Query,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { DocumentTypesService } from './document-type.service';
import { CreateDocumentTypeDto } from './dto/create-document-type.dto';
import { UpdateDocumentTypeDto } from './dto/update-document-type.dto';
import { DocumentTypeResponse } from 'src/common/types';
import {
  DocumentTypeResponseDto,
  PaginatedDocumentTypeResponseDto,
} from './dto/document-type-response.dto';
import { QueryOptionsDto } from 'src/common/dto/query-options.dto';
import { AuthGuard } from '../auth/auth.gaurd';

@ApiTags('Document Types')
@UseGuards(AuthGuard)
@Controller({ path: 'document-types', version: '1' })
export class DocumentTypeController {
  constructor(private readonly documentTypesService: DocumentTypesService) {}

  // ────────────────────────────────────────────────
  // CREATE
  // ────────────────────────────────────────────────
  @Post()
  @ApiResponse({
    status: 201,
    description: 'Document type created successfully',
    type: DocumentTypeResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: 'Document type with same name already exists',
  })
  async create(
    @Body() dto: CreateDocumentTypeDto,
  ): Promise<DocumentTypeResponse> {
    return this.documentTypesService.create(dto);
  }

  /**
   * GET /document-types — list document types with pagination, search, sort, and filters.
   */
  @Get()
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Filter document types by name (case-insensitive)',
    example: 'Insurance',
  })
  @ApiResponse({
    status: 200,
    description: 'List of document types retrieved successfully',
    type: PaginatedDocumentTypeResponseDto,
  })
  async findAll(
    @Query() query: QueryOptionsDto,
  ): Promise<PaginatedDocumentTypeResponseDto> {
    return this.documentTypesService.findAll(query);
  }

  // ────────────────────────────────────────────────
  // READ ONE
  // ────────────────────────────────────────────────
  @Get(':id')
  @ApiResponse({
    status: 200,
    description: 'Document type fetched successfully',
    type: DocumentTypeResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Document type not found' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<DocumentTypeResponse> {
    return this.documentTypesService.findOne(id);
  }

  // ────────────────────────────────────────────────
  // UPDATE
  // ────────────────────────────────────────────────
  @Patch(':id')
  @ApiResponse({
    status: 200,
    description: 'Document type updated successfully',
    type: DocumentTypeResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Document type not found' })
  @ApiResponse({ status: 409, description: 'Duplicate document type name' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateDocumentTypeDto,
  ): Promise<DocumentTypeResponse> {
    return this.documentTypesService.update(id, dto);
  }

  // ────────────────────────────────────────────────
  // DELETE
  // ────────────────────────────────────────────────
  @Delete(':id')
  @ApiResponse({
    status: 200,
    description: 'Document type deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Document type not found' })
  @ApiResponse({
    status: 400,
    description: 'Cannot delete document type linked to vehicle documents',
  })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{ success: boolean }> {
    return this.documentTypesService.remove(id);
  }
}
