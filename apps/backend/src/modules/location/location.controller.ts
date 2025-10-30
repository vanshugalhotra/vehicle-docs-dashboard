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
import { ApiTags, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { LocationService } from './location.service';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { LocationResponse } from 'src/common/types';
import {
  LocationResponseDto,
  PaginatedLocationResponseDto,
} from './dto/location-response';
import { QueryOptionsDto } from 'src/common/dto/query-options.dto';

@ApiTags('Location')
@Controller({ path: 'locations', version: '1' })
export class LocationController {
  constructor(private readonly locationsService: LocationService) {}

  @Post()
  @ApiResponse({
    status: 201,
    description: 'Location created successfully',
    type: LocationResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: 'Location with same name already exists',
  })
  async create(@Body() dto: CreateLocationDto): Promise<LocationResponse> {
    return this.locationsService.create(dto);
  }
  // ────────────────────────────────────────────────
  // READ ALL (with unified query control)
  // ────────────────────────────────────────────────

  @Get()
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Filter locations by name (case-insensitive)',
    example: 'Warehouse',
  })
  @ApiResponse({
    status: 200,
    description: 'List of locations retrieved successfully',
    type: PaginatedLocationResponseDto,
  })
  async findAll(
    @Query() query: QueryOptionsDto,
  ): Promise<PaginatedLocationResponseDto> {
    return this.locationsService.findAll(query);
  }

  @Get(':id')
  @ApiResponse({
    status: 200,
    description: 'Location fetched successfully',
    type: LocationResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Location not found' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<LocationResponse> {
    return this.locationsService.findOne(id);
  }

  @Patch(':id')
  @ApiResponse({
    status: 200,
    description: 'Location updated successfully',
    type: LocationResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Location not found' })
  @ApiResponse({ status: 409, description: 'Duplicate location name' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateLocationDto,
  ): Promise<LocationResponse> {
    return this.locationsService.update(id, dto);
  }

  @Delete(':id')
  @ApiResponse({
    status: 200,
    description: 'Location deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Location not found' })
  @ApiResponse({
    status: 409,
    description: 'Cannot delete location linked to vehicles',
  })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{ success: boolean }> {
    return this.locationsService.remove(id);
  }
}
