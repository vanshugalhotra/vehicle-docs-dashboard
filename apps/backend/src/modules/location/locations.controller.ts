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
import { LocationsService } from './locations.service';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { LocationResponse } from 'src/common/types';
import {
  LocationResponseDto,
  PaginatedLocationResponseDto,
} from './dto/location-response';

@ApiTags('Location')
@Controller({ path: 'locations', version: '1' })
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

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
  // READ ALL (search-enabled)
  // ────────────────────────────────────────────────

  @Get()
  @ApiQuery({ name: 'skip', required: false, type: Number, example: 0 })
  @ApiQuery({ name: 'take', required: false, type: Number, example: 20 })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Filter locations by partial name match',
    example: 'Warehouse',
  })
  @ApiResponse({
    status: 200,
    description: 'List of locations retrieved successfully',
    type: PaginatedLocationResponseDto,
  })
  async findAll(
    @Query('search') search?: string,
    @Query('skip') skip?: number,
    @Query('take') take?: number,
  ): Promise<PaginatedLocationResponseDto> {
    return this.locationsService.findAll(skip, take, search);
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
