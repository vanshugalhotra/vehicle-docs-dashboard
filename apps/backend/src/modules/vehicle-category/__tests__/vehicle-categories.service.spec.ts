import { Test, TestingModule } from '@nestjs/testing';
import { VehicleCategoryService } from '../vehicle-categories.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { LoggerService } from '../../../common/logger/logger.service';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';

// Helper to mock Prisma methods
const mockPrisma = () => ({
  vehicleCategory: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
});

// Helper to mock Logger
const mockLogger = () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
});

describe('VehicleCategoryService', () => {
  let service: VehicleCategoryService;
  let prisma: ReturnType<typeof mockPrisma>;
  let logger: ReturnType<typeof mockLogger>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VehicleCategoryService,
        { provide: PrismaService, useFactory: mockPrisma },
        { provide: LoggerService, useFactory: mockLogger },
      ],
    }).compile();

    service = module.get<VehicleCategoryService>(VehicleCategoryService);
    prisma = module.get(PrismaService);
    logger = module.get(LoggerService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a category successfully', async () => {
      const dto: CreateCategoryDto = { name: 'Car' };
      prisma.vehicleCategory.findUnique.mockResolvedValue(null);
      prisma.vehicleCategory.create.mockResolvedValue({
        id: '1',
        name: dto.name,
      });

      const result = await service.create(dto);

      expect(result.name).toBe(dto.name);
      expect(prisma.vehicleCategory.create).toHaveBeenCalledWith({
        data: { name: dto.name },
      });
      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining('Creating vehicle category'),
      );
    });

    it('should throw conflict if category exists', async () => {
      const dto: CreateCategoryDto = { name: 'Car' };
      prisma.vehicleCategory.findUnique.mockResolvedValue({
        id: '1',
        name: 'Car',
      });

      await expect(service.create(dto)).rejects.toThrow(ConflictException);
      expect(logger.warn).toHaveBeenCalledWith(
        expect.stringContaining('already exists'),
      );
    });
  });

  describe('findAll', () => {
    it('should return all categories', async () => {
      const mockCategories = [
        { id: '1', name: 'Car', types: [] },
        { id: '2', name: 'Bike', types: [] },
      ];
      prisma.vehicleCategory.findMany.mockResolvedValue(mockCategories);

      const result = await service.findAll();

      expect(result).toHaveLength(2);
      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining('Fetching all vehicle categories'),
      );
    });

    it('should return filtered categories by search', async () => {
      const mockCategories = [{ id: '2', name: 'Bike', types: [] }];
      prisma.vehicleCategory.findMany.mockResolvedValue(mockCategories);

      const result = await service.findAll('Bike');

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Bike');
    });
  });

  describe('findOne', () => {
    it('should return a category by id', async () => {
      prisma.vehicleCategory.findUnique.mockResolvedValue({
        id: '1',
        name: 'Car',
        types: [],
      });

      const result = await service.findOne('1');

      expect(result.id).toBe('1');
      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining('Fetching vehicle category by id'),
      );
    });

    it('should throw NotFoundException if category does not exist', async () => {
      prisma.vehicleCategory.findUnique.mockResolvedValue(null);

      await expect(service.findOne('1')).rejects.toThrow(NotFoundException);
      expect(logger.warn).toHaveBeenCalledWith(
        expect.stringContaining('not found'),
      );
    });
  });

  describe('update', () => {
    it('should update category successfully', async () => {
      const dto: UpdateCategoryDto = { name: 'Truck' };
      prisma.vehicleCategory.findUnique
        .mockResolvedValueOnce({ id: '1', name: 'Car' }) // existing category
        .mockResolvedValueOnce(null); // no conflict
      prisma.vehicleCategory.update.mockResolvedValue({
        id: '1',
        name: 'Truck',
      });

      const result = await service.update('1', dto);

      expect(result.name).toBe('Truck');
      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining('Updating vehicle category'),
      );
    });

    it('should throw NotFoundException if category not found', async () => {
      prisma.vehicleCategory.findUnique.mockResolvedValue(null);

      await expect(service.update('1', { name: 'Truck' })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ConflictException if new name already exists', async () => {
      prisma.vehicleCategory.findUnique
        .mockResolvedValueOnce({ id: '1', name: 'Car' }) // existing category
        .mockResolvedValueOnce({ id: '2', name: 'Truck' }); // conflict
      const dto: UpdateCategoryDto = { name: 'Truck' };

      await expect(service.update('1', dto)).rejects.toThrow(ConflictException);
      expect(logger.warn).toHaveBeenCalledWith(
        expect.stringContaining('duplicate category name'),
      );
    });
  });

  describe('remove', () => {
    it('should delete category successfully', async () => {
      prisma.vehicleCategory.findUnique.mockResolvedValue({
        id: '1',
        name: 'Car',
      });
      prisma.vehicleCategory.delete.mockResolvedValue({});

      const result = await service.remove('1');

      expect(result.success).toBe(true);
      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining('Deleting vehicle category'),
      );
    });

    it('should throw NotFoundException if category not found', async () => {
      prisma.vehicleCategory.findUnique.mockResolvedValue(null);

      await expect(service.remove('1')).rejects.toThrow(NotFoundException);
      expect(logger.warn).toHaveBeenCalledWith(
        expect.stringContaining('Delete failed'),
      );
    });
  });
});
