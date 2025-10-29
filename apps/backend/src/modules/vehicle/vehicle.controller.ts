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
import { VehicleService } from './vehicles.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import {
  PaginatedVehicleResponseDto,
  VehicleResponseDto,
} from './dto/vehicle-response.dto';
import { VehicleResponse } from 'src/common/types';
import { QueryOptionsDto } from 'src/common/dto/query-options.dto';

@ApiTags('Vehicles')
@Controller({ path: 'vehicles', version: '1' })
export class VehicleController {
  constructor(private readonly vehiclesService: VehicleService) {}

  // ────────────────────────────────────────────────
  // CREATE
  // ────────────────────────────────────────────────
  @Post()
  @ApiResponse({
    status: 201,
    description: 'Vehicle created successfully',
    type: VehicleResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: 'Vehicle with same identifiers exists',
  })
  async create(@Body() dto: CreateVehicleDto): Promise<VehicleResponse> {
    return this.vehiclesService.create(dto);
  }

  /**
   * Retrieve paginated list of vehicles with optional search, sorting, and filters
   */
  @Get()
  @ApiResponse({
    status: 200,
    description: 'List of vehicles retrieved successfully',
    type: PaginatedVehicleResponseDto,
  })
  async findAll(
    @Query() query: QueryOptionsDto,
  ): Promise<PaginatedVehicleResponseDto> {
    return this.vehiclesService.findAll(query);
  }

  // ────────────────────────────────────────────────
  // READ ONE
  // ────────────────────────────────────────────────
  @Get(':id')
  @ApiResponse({ status: 200, description: 'Vehicle fetched successfully' })
  @ApiResponse({ status: 404, description: 'Vehicle not found' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<VehicleResponse> {
    return this.vehiclesService.findOne(id);
  }

  // ────────────────────────────────────────────────
  // UPDATE
  // ────────────────────────────────────────────────
  @Patch(':id')
  @ApiResponse({ status: 200, description: 'Vehicle updated successfully' })
  @ApiResponse({ status: 404, description: 'Vehicle not found' })
  @ApiResponse({
    status: 409,
    description: 'Another vehicle with same identifiers exists',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateVehicleDto,
  ): Promise<VehicleResponse> {
    return this.vehiclesService.update(id, dto);
  }

  // ────────────────────────────────────────────────
  // DELETE
  // ────────────────────────────────────────────────
  @Delete(':id')
  @ApiResponse({ status: 200, description: 'Vehicle deleted successfully' })
  @ApiResponse({ status: 404, description: 'Vehicle not found' })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{ success: boolean }> {
    return this.vehiclesService.remove(id);
  }
}
