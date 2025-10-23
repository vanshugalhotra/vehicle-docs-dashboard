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
import { OwnersService } from './owners.service';
import { CreateOwnerDto } from './dto/create-owner.dto';
import { UpdateOwnerDto } from './dto/update-owner.dto';
import { OwnerResponse } from 'src/common/types';
import {
  OwnerResponseDto,
  PaginatedOwnerResponseDto,
} from './dto/owner-response.dto';

@ApiTags('Owners')
@Controller({ path: 'owners', version: '1' })
export class OwnersController {
  constructor(private readonly ownersService: OwnersService) {}

  // ────────────────────────────────────────────────
  // CREATE
  // ────────────────────────────────────────────────
  @Post()
  @ApiResponse({
    status: 201,
    description: 'Owner created successfully',
    type: OwnerResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: 'Owner with same name already exists',
  })
  async create(@Body() dto: CreateOwnerDto): Promise<OwnerResponse> {
    return this.ownersService.create(dto);
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
    description: 'Filter owners by partial name match',
    example: 'Ustaad',
  })
  @ApiResponse({
    status: 200,
    description: 'List of Owners retrieved successfully',
    type: PaginatedOwnerResponseDto,
  })
  async findAll(
    @Query('search') search?: string,
    @Query('skip') skip?: number,
    @Query('take') take?: number,
  ): Promise<PaginatedOwnerResponseDto> {
    return this.ownersService.findAll(skip, take, search);
  }

  // ────────────────────────────────────────────────
  // READ ONE
  // ────────────────────────────────────────────────
  @Get(':id')
  @ApiResponse({
    status: 200,
    description: 'Owner fetched successfully',
    type: OwnerResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Owner not found' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<OwnerResponse> {
    return this.ownersService.findOne(id);
  }

  // ────────────────────────────────────────────────
  // UPDATE
  // ────────────────────────────────────────────────
  @Patch(':id')
  @ApiResponse({
    status: 200,
    description: 'Owner updated successfully',
    type: OwnerResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Owner not found' })
  @ApiResponse({ status: 409, description: 'Duplicate owner name' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateOwnerDto,
  ): Promise<OwnerResponse> {
    return this.ownersService.update(id, dto);
  }

  // ────────────────────────────────────────────────
  // DELETE
  // ────────────────────────────────────────────────
  @Delete(':id')
  @ApiResponse({
    status: 200,
    description: 'Owner deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Owner not found' })
  @ApiResponse({
    status: 409,
    description: 'Cannot delete owner linked to vehicles',
  })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{ success: boolean }> {
    return this.ownersService.remove(id);
  }
}
