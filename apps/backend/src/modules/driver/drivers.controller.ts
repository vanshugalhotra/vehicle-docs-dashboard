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
import { DriversService } from './drivers.service';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';
import { DriverResponse } from 'src/common/types';
import { DriverResponseDto } from './dto/driver-response.dto';

@ApiTags('Drivers')
@Controller({ path: 'drivers', version: '1' })
export class DriversController {
  constructor(private readonly driversService: DriversService) {}

  // ────────────────────────────────────────────────
  // CREATE
  // ────────────────────────────────────────────────
  @Post()
  @ApiResponse({
    status: 201,
    description: 'Driver created successfully',
    type: DriverResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: 'Driver with same phone or email already exists',
  })
  async create(@Body() dto: CreateDriverDto): Promise<DriverResponse> {
    return this.driversService.create(dto);
  }

  // ────────────────────────────────────────────────
  // READ ALL (search-enabled)
  // ────────────────────────────────────────────────
  @Get()
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Filter drivers by partial match on name, phone, or email',
    example: 'John',
  })
  @ApiResponse({
    status: 200,
    description: 'List of drivers retrieved successfully',
    type: [DriverResponseDto],
  })
  async findAll(@Query('search') search?: string): Promise<DriverResponse[]> {
    return this.driversService.findAll(search);
  }

  // ────────────────────────────────────────────────
  // READ ONE
  // ────────────────────────────────────────────────
  @Get(':id')
  @ApiResponse({
    status: 200,
    description: 'Driver fetched successfully',
    type: DriverResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Driver not found' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<DriverResponse> {
    return this.driversService.findOne(id);
  }

  // ────────────────────────────────────────────────
  // UPDATE
  // ────────────────────────────────────────────────
  @Patch(':id')
  @ApiResponse({
    status: 200,
    description: 'Driver updated successfully',
    type: DriverResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Driver not found' })
  @ApiResponse({
    status: 409,
    description: 'Duplicate phone or email found',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateDriverDto,
  ): Promise<DriverResponse> {
    return this.driversService.update(id, dto);
  }

  // ────────────────────────────────────────────────
  // DELETE
  // ────────────────────────────────────────────────
  @Delete(':id')
  @ApiResponse({
    status: 200,
    description: 'Driver deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Driver not found' })
  @ApiResponse({
    status: 409,
    description: 'Cannot delete driver linked to vehicles',
  })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{ success: boolean }> {
    return this.driversService.remove(id);
  }
}
