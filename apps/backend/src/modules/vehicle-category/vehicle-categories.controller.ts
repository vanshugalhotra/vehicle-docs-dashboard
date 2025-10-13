import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { VehicleCategoryService } from './vehicle-categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { VehicleCategoryResponse } from 'src/common/types';
import { CategoryResponseDto } from './dto/category-response.dto';

@ApiTags('Vehicle Categories')
@Controller({ path: 'vehicle-categories', version: '1' })
export class VehicleCategoryController {
  constructor(private readonly categoryService: VehicleCategoryService) {}

  // ────────────────────────────────────────────────
  // CREATE
  // ────────────────────────────────────────────────
  @Post()
  @ApiResponse({
    status: 201,
    description: 'Vehicle category created successfully',
    type: CategoryResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: 'Vehicle category with same name already exists',
  })
  async create(
    @Body() dto: CreateCategoryDto,
  ): Promise<VehicleCategoryResponse> {
    return this.categoryService.create(dto);
  }

  // ────────────────────────────────────────────────
  // READ ALL (search-enabled for dropdown)
  // ────────────────────────────────────────────────
  @Get()
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Filter categories by partial name match',
    example: 'Truck',
  })
  @ApiResponse({
    status: 200,
    description: 'List of vehicle categories retrieved successfully',
    type: [CategoryResponseDto],
  })
  async findAll(
    @Query('search') search?: string,
  ): Promise<VehicleCategoryResponse[]> {
    return this.categoryService.findAll(search);
  }

  // ────────────────────────────────────────────────
  // READ ONE
  // ────────────────────────────────────────────────
  @Get(':id')
  @ApiResponse({
    status: 200,
    description: 'Vehicle category fetched successfully',
    type: CategoryResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Vehicle category not found' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<VehicleCategoryResponse> {
    return this.categoryService.findOne(id);
  }

  // ────────────────────────────────────────────────
  // UPDATE
  // ────────────────────────────────────────────────
  @Put(':id')
  @ApiResponse({
    status: 200,
    description: 'Vehicle category updated successfully',
    type: CategoryResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Vehicle category not found' })
  @ApiResponse({
    status: 409,
    description: 'Vehicle category with same name already exists',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCategoryDto,
  ): Promise<VehicleCategoryResponse> {
    return this.categoryService.update(id, dto);
  }

  // ────────────────────────────────────────────────
  // DELETE
  // ────────────────────────────────────────────────
  @Delete(':id')
  @ApiResponse({
    status: 200,
    description: 'Vehicle category deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Vehicle category not found' })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{ success: boolean }> {
    return this.categoryService.remove(id);
  }
}
