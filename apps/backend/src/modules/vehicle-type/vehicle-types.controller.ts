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
import { VehicleTypeService } from './vehicle-types.service';
import { CreateVehicleTypeDto } from './dto/create-type.dto';
import { UpdateVehicleTypeDto } from './dto/update-type.dto';
import { VehicleTypeResponse } from 'src/common/types';
import {
  PaginatedTypeResponseDto,
  TypeResponseDto,
} from './dto/type-response.dto';
import { QueryOptionsDto } from 'src/common/dto/query-options.dto';

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
  @ApiResponse({
    status: 200,
    description: 'Vehicle types retrieved successfully',
    type: PaginatedTypeResponseDto,
  })
  async findAll(
    @Query() query: QueryOptionsDto,
  ): Promise<PaginatedTypeResponseDto> {
    return this.vehicleTypeService.findAll(query);
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
