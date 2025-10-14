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
import { VehicleTypeService } from './vehicle-types.service';
import { CreateVehicleTypeDto } from './dto/create-type.dto';
import { UpdateVehicleTypeDto } from './dto/update-type.dto';
import { VehicleTypeResponse } from 'src/common/types';
import { TypeResponseDto } from './dto/type-response.dto';

@ApiTags('Vehicle Types')
@Controller({ path: 'vehicle-types', version: '1' })
export class VehicleTypeController {
  constructor(private readonly vehicleTypeService: VehicleTypeService) {}

  @Post()
  @ApiResponse({
    status: 201,
    description: 'Vehicle type created successfully',
    type: TypeResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Category not found' })
  @ApiResponse({
    status: 409,
    description: 'Vehicle type with same name already exists in this category',
  })
  async create(
    @Body() dto: CreateVehicleTypeDto,
  ): Promise<VehicleTypeResponse> {
    return this.vehicleTypeService.create(dto);
  }

  @Get()
  @ApiQuery({
    name: 'categoryId',
    required: false,
    description: 'Filter by category',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Search by partial type name',
  })
  @ApiResponse({
    status: 200,
    description: 'Vehicle types retrieved successfully',
    type: [TypeResponseDto],
  })
  async findAll(
    @Query('categoryId') categoryId?: string,
    @Query('search') search?: string,
  ): Promise<VehicleTypeResponse[]> {
    return this.vehicleTypeService.findAll(categoryId, search);
  }

  @Get(':id')
  @ApiResponse({
    status: 200,
    description: 'Vehicle type fetched successfully',
    type: TypeResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Vehicle type not found' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<VehicleTypeResponse> {
    return this.vehicleTypeService.findOne(id);
  }

  @Patch(':id')
  @ApiResponse({
    status: 200,
    description: 'Vehicle type updated successfully',
    type: TypeResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Vehicle type not found' })
  @ApiResponse({
    status: 409,
    description: 'Vehicle type with same name already exists in this category',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateVehicleTypeDto,
  ): Promise<VehicleTypeResponse> {
    return this.vehicleTypeService.update(id, dto);
  }

  @Delete(':id')
  @ApiResponse({
    status: 200,
    description: 'Vehicle type deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Vehicle type not found' })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{ success: boolean }> {
    return this.vehicleTypeService.remove(id);
  }
}
