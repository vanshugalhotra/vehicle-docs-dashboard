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
} from '@nestjs/common';
import { ApiTags, ApiResponse } from '@nestjs/swagger';
import { VehicleDocumentService } from './vehicle-document.service';
import { CreateVehicleDocumentDto } from './dto/create-vehicle-document.dto';
import { UpdateVehicleDocumentDto } from './dto/update-vehicle-document.dto';
import {
  VehicleDocumentResponseDto,
  PaginatedVehicleDocumentResponseDto,
} from './dto/vehicle-document-response.dto';
import { QueryOptionsDto } from 'src/common/dto/query-options.dto';

@ApiTags('Vehicle Documents')
@Controller({ path: 'vehicle-documents', version: '1' })
export class VehicleDocumentController {
  constructor(
    private readonly vehicleDocumentsService: VehicleDocumentService,
  ) {}

  // ────────────────────────────────────────────────
  // CREATE
  // ────────────────────────────────────────────────
  @Post()
  @ApiResponse({
    status: 201,
    description: 'Vehicle document created successfully',
    type: VehicleDocumentResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Vehicle or DocumentType not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Document with same documentNo already exists',
  })
  async create(
    @Body() dto: CreateVehicleDocumentDto,
  ): Promise<VehicleDocumentResponseDto> {
    return this.vehicleDocumentsService.create(dto);
  }

  // ────────────────────────────────────────────────
  // READ ALL (Paginated + Searchable)
  // ────────────────────────────────────────────────
  @Get()
  @ApiResponse({
    status: 200,
    description: 'List of vehicle documents retrieved successfully',
    type: PaginatedVehicleDocumentResponseDto,
  })
  async findAll(
    @Query() query: QueryOptionsDto,
  ): Promise<PaginatedVehicleDocumentResponseDto> {
    return this.vehicleDocumentsService.findAll(query);
  }

  // ────────────────────────────────────────────────
  // READ ONE
  // ────────────────────────────────────────────────
  @Get(':id')
  @ApiResponse({
    status: 200,
    description: 'Vehicle document fetched successfully',
    type: VehicleDocumentResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Vehicle document not found' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<VehicleDocumentResponseDto> {
    return this.vehicleDocumentsService.findOne(id);
  }

  // ────────────────────────────────────────────────
  // UPDATE
  // ────────────────────────────────────────────────
  @Patch(':id')
  @ApiResponse({
    status: 200,
    description: 'Vehicle document updated successfully',
    type: VehicleDocumentResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Vehicle document not found' })
  @ApiResponse({
    status: 409,
    description: 'Another document with same documentNo already exists',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateVehicleDocumentDto,
  ): Promise<VehicleDocumentResponseDto> {
    return this.vehicleDocumentsService.update(id, dto);
  }

  // ────────────────────────────────────────────────
  // DELETE
  // ────────────────────────────────────────────────
  @Delete(':id')
  @ApiResponse({
    status: 200,
    description: 'Vehicle document deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Vehicle document not found' })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{ success: boolean }> {
    return this.vehicleDocumentsService.remove(id);
  }
}
