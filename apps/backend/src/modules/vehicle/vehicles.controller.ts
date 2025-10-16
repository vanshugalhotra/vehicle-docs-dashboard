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
import { ApiTags, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { VehiclesService } from './vehicles.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { VehicleResponseDto } from './dto/vehicle-response.dto';
import { VehicleResponse } from 'src/common/types';

@ApiTags('Vehicles')
@Controller({ path: 'vehicles', version: '1' })
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

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

  // ────────────────────────────────────────────────
  // READ ALL (with pagination)
  // ────────────────────────────────────────────────
  @Get()
  @ApiQuery({ name: 'skip', required: false, type: Number, example: 0 })
  @ApiQuery({ name: 'take', required: false, type: Number, example: 20 })
  async findAll(
    @Query('skip') skip?: number,
    @Query('take') take?: number,
  ): Promise<VehicleResponse[]> {
    return this.vehiclesService.findAll(skip, take);
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
