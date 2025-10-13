import { Test, TestingModule } from '@nestjs/testing';
import { VehicleTypeService } from '../vehicle-types.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { LoggerService } from '../../../common/logger/logger.service';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { CreateVehicleTypeDto } from '../dto/create-type.dto';
import { UpdateVehicleTypeDto } from '../dto/update-type.dto';

type MockedPrismaModel = Record<string, jest.Mock>;
type MockedLogger = Record<string, jest.Mock>;

describe('VehicleTypeService', () => {
  let service: VehicleTypeService;
  let prisma: {
    vehicleCategory: MockedPrismaModel;
    vehicleType: MockedPrismaModel;
  };
  let logger: MockedLogger;

  beforeEach(async () => {
    prisma = {
      vehicleCategory: {
        findUnique: jest.fn(),
      },
      vehicleType: {
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    logger = {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      debug: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VehicleTypeService,
        { provide: PrismaService, useValue: prisma },
        { provide: LoggerService, useValue: logger },
      ],
    }).compile();

    service = module.get(VehicleTypeService);
  });

  describe('create', () => {
    it('should create a vehicle type when category exists and no duplicate', async () => {
      const dto: CreateVehicleTypeDto = { name: 'Sedan', categoryId: 'cat1' };
      prisma.vehicleCategory.findUnique.mockResolvedValue({
        id: 'cat1',
        name: 'Cars',
      });
      prisma.vehicleType.findFirst.mockResolvedValue(null);
      prisma.vehicleType.create.mockResolvedValue({
        id: 'type1',
        name: 'Sedan',
        category: { id: 'cat1' },
      });

      const result = await service.create(dto);

      expect(result.name).toBe('Sedan');
      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining('Creating vehicle type'),
      );
    });

    it('should throw NotFoundException if category does not exist', async () => {
      prisma.vehicleCategory.findUnique.mockResolvedValue(null);
      await expect(
        service.create({ name: 'SUV', categoryId: 'catX' }),
      ).rejects.toThrow(NotFoundException);
      expect(logger.warn).toHaveBeenCalledWith(
        expect.stringContaining('Category not found'),
      );
    });

    it('should throw ConflictException if duplicate type exists', async () => {
      prisma.vehicleCategory.findUnique.mockResolvedValue({ id: 'cat1' });
      prisma.vehicleType.findFirst.mockResolvedValue({ id: 'type1' });

      await expect(
        service.create({ name: 'Sedan', categoryId: 'cat1' }),
      ).rejects.toThrow(ConflictException);
      expect(logger.warn).toHaveBeenCalledWith(
        expect.stringContaining('Vehicle type already exists'),
      );
    });
  });

  describe('findAll', () => {
    it('should return all types', async () => {
      prisma.vehicleType.findMany.mockResolvedValue([
        { id: 'type1', name: 'Sedan', category: { id: 'cat1' } },
      ]);

      const result = await service.findAll();
      expect(result).toHaveLength(1);
      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining('Fetching vehicle types'),
      );
    });
  });

  describe('findOne', () => {
    it('should return type if exists', async () => {
      prisma.vehicleType.findUnique.mockResolvedValue({
        id: 'type1',
        name: 'Sedan',
        category: { id: 'cat1' },
      });
      const result = await service.findOne('type1');
      expect(result.name).toBe('Sedan');
    });

    it('should throw NotFoundException if type does not exist', async () => {
      prisma.vehicleType.findUnique.mockResolvedValue(null);
      await expect(service.findOne('typeX')).rejects.toThrow(NotFoundException);
      expect(logger.warn).toHaveBeenCalledWith(
        expect.stringContaining('Vehicle type not found'),
      );
    });
  });

  describe('update', () => {
    it('should update type when valid', async () => {
      prisma.vehicleType.findUnique.mockResolvedValueOnce({
        id: 'type1',
        name: 'Sedan',
        categoryId: 'cat1',
      });
      prisma.vehicleType.findFirst.mockResolvedValueOnce(null);
      prisma.vehicleType.update.mockResolvedValue({
        id: 'type1',
        name: 'SUV',
        category: { id: 'cat1' },
      });

      const dto: UpdateVehicleTypeDto = { name: 'SUV' };
      const result = await service.update('type1', dto);

      expect(result.name).toBe('SUV');
      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining('Updating vehicle type'),
      );
    });

    it('should throw ConflictException if duplicate exists', async () => {
      prisma.vehicleType.findUnique.mockResolvedValueOnce({
        id: 'type1',
        name: 'Sedan',
        categoryId: 'cat1',
      });
      prisma.vehicleType.findFirst.mockResolvedValueOnce({
        id: 'type2',
      });

      await expect(service.update('type1', { name: 'SUV' })).rejects.toThrow(
        ConflictException,
      );
      expect(logger.warn).toHaveBeenCalledWith(
        expect.stringContaining('Duplicate vehicle type'),
      );
    });

    it('should throw NotFoundException if type not found', async () => {
      prisma.vehicleType.findUnique.mockResolvedValueOnce(null);
      await expect(service.update('typeX', { name: 'SUV' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should delete type if exists', async () => {
      prisma.vehicleType.findUnique.mockResolvedValue({ id: 'type1' });
      prisma.vehicleType.delete.mockResolvedValue({});

      const result = await service.remove('type1');
      expect(result.success).toBe(true);
      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining('Deleting vehicle type'),
      );
    });

    it('should throw NotFoundException if type not found', async () => {
      prisma.vehicleType.findUnique.mockResolvedValue(null);
      await expect(service.remove('typeX')).rejects.toThrow(NotFoundException);
    });
  });
});
