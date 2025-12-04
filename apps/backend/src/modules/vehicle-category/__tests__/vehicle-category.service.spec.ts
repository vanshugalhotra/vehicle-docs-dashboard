import { VehicleCategoryService } from '../vehicle-category.service';
import { createTestModule } from '../../../../test/utils/unit-setup/test-setup';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { MockedPrisma } from '../../../../test/utils/unit-setup/mock-prisma';
import { MockedLogger } from '../../../../test/utils/unit-setup/mock-logger';
import { VehicleCategoryValidationService } from '../validation/vehicle-category-validation.service';
import { VehicleCategory } from '@prisma/client';

const mockCategory: VehicleCategory = {
  id: 'cat1',
  name: 'Car',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockVehicleCategoryValidationService = {
  validateCreate: jest.fn().mockResolvedValue(null),
  validateUpdate: jest.fn().mockImplementation(
    (id: string, name?: string) =>
      ({
        ...mockCategory,
        id,
        name: name ?? mockCategory.name,
      }) as VehicleCategory,
  ),
};

describe('VehicleCategoryService', () => {
  let service: VehicleCategoryService;
  let prisma: MockedPrisma;
  let logger: MockedLogger;

  beforeEach(async () => {
    jest.clearAllMocks();
    mockVehicleCategoryValidationService.validateCreate.mockResolvedValue(null);
    mockVehicleCategoryValidationService.validateUpdate.mockImplementation(
      (id: string, name?: string) =>
        ({
          ...mockCategory,
          id,
          name: name ?? mockCategory.name,
        }) as VehicleCategory,
    );

    const setup = await createTestModule(VehicleCategoryService, [
      {
        provide: VehicleCategoryValidationService,
        useValue: mockVehicleCategoryValidationService,
      },
    ]);
    service = setup.service;
    prisma = setup.mocks.prisma;
    logger = setup.mocks.logger;
  });

  afterEach(() => jest.clearAllMocks());

  describe('create', () => {
    it('should create category', async () => {
      prisma.vehicleCategory.create.mockResolvedValue({
        id: '1',
        name: 'Car',
      } as VehicleCategory);

      const result = await service.create({ name: 'Car' });

      expect(
        mockVehicleCategoryValidationService.validateCreate,
      ).toHaveBeenCalledWith('Car');
      expect(result.name).toBe('Car');
      expect(prisma.vehicleCategory.create).toHaveBeenCalledWith({
        data: { name: 'Car' },
      });
      expect(logger.logInfo).toHaveBeenCalledWith(
        expect.stringContaining('Creating'),
        expect.any(Object),
      );
      expect(logger.logInfo).toHaveBeenCalledWith(
        expect.stringContaining('Vehicle category created'),
        expect.any(Object),
      );
    });

    it('should throw ConflictException if exists', async () => {
      mockVehicleCategoryValidationService.validateCreate.mockRejectedValueOnce(
        new ConflictException(
          'Vehicle category with name "Car" already exists',
        ),
      );

      await expect(service.create({ name: 'Car' })).rejects.toThrow(
        ConflictException,
      );
      expect(
        mockVehicleCategoryValidationService.validateCreate,
      ).toHaveBeenCalledWith('Car');
      expect(logger.logError).toHaveBeenCalledWith(
        expect.stringContaining('Failed'),
        expect.any(Object),
      );
    });
  });

  describe('findAll', () => {
    it('should return all categories', async () => {
      prisma.vehicleCategory.findMany.mockResolvedValue([
        { id: '1', name: 'Car' } as VehicleCategory,
      ]);
      prisma.vehicleCategory.count.mockResolvedValue(1);

      const result = await service.findAll({});

      expect(result.items).toHaveLength(1);
      expect(logger.logDebug).toHaveBeenCalledWith(
        expect.stringContaining('Fetching'),
        expect.any(Object),
      );
      expect(logger.logInfo).toHaveBeenCalledWith(
        expect.stringContaining('Fetched'),
        expect.any(Object),
      );
    });
  });

  describe('findOne', () => {
    it('should return category if exists', async () => {
      prisma.vehicleCategory.findUnique.mockResolvedValue({
        id: '1',
        name: 'Car',
      } as VehicleCategory);

      const result = await service.findOne('1');

      expect(result.id).toBe('1');
      expect(logger.logInfo).toHaveBeenCalledWith(
        expect.stringContaining('Fetching'),
        expect.any(Object),
      );
    });

    it('should throw NotFoundException if not found', async () => {
      prisma.vehicleCategory.findUnique.mockResolvedValue(null);

      await expect(service.findOne('X')).rejects.toThrow(NotFoundException);
      expect(logger.logWarn).toHaveBeenCalledWith(
        expect.stringContaining('not found'),
        expect.any(Object),
      );
    });
  });

  describe('update', () => {
    const updateDto = { name: 'Truck' };

    it('should update successfully', async () => {
      mockVehicleCategoryValidationService.validateUpdate.mockResolvedValueOnce(
        {
          ...mockCategory,
          id: '1',
          name: 'Car',
        } as VehicleCategory,
      );

      prisma.vehicleCategory.update.mockResolvedValue({
        id: '1',
        name: 'Truck',
      } as VehicleCategory);

      prisma.vehicle.findMany.mockResolvedValue([
        {
          id: 'v1',
          licensePlate: 'ABC123',
          type: { name: 'Sedan' },
        },
        {
          id: 'v2',
          licensePlate: 'XYZ789',
          type: { name: 'SUV' },
        },
      ]);

      prisma.vehicle.update.mockImplementation(
        ({
          where,
          data,
        }: {
          where: { id: string };
          data: { name: string };
        }) => {
          return { id: where.id, name: data.name };
        },
      );

      const result = await service.update('1', updateDto);

      expect(
        mockVehicleCategoryValidationService.validateUpdate,
      ).toHaveBeenCalledWith('1', updateDto.name);
      expect(result.name).toBe('Truck');
      expect(logger.logInfo).toHaveBeenCalledWith(
        expect.stringContaining('Updating'),
        expect.any(Object),
      );
      expect(logger.logInfo).toHaveBeenCalledWith(
        expect.stringContaining('Vehicle category updated'),
        expect.any(Object),
      );
    });

    it('should throw NotFoundException if category not found', async () => {
      mockVehicleCategoryValidationService.validateUpdate.mockRejectedValueOnce(
        new NotFoundException('Vehicle category with id "X" not found'),
      );

      await expect(service.update('X', updateDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(
        mockVehicleCategoryValidationService.validateUpdate,
      ).toHaveBeenCalledWith('X', updateDto.name);
      expect(logger.logError).toHaveBeenCalledWith(
        expect.stringContaining('Failed'),
        expect.any(Object),
      );
    });

    it('should throw ConflictException if duplicate name exists', async () => {
      mockVehicleCategoryValidationService.validateUpdate.mockRejectedValueOnce(
        new ConflictException(
          'Vehicle category with name "Truck" already exists',
        ),
      );

      await expect(service.update('1', updateDto)).rejects.toThrow(
        ConflictException,
      );
      expect(
        mockVehicleCategoryValidationService.validateUpdate,
      ).toHaveBeenCalledWith('1', updateDto.name);
      expect(logger.logError).toHaveBeenCalledWith(
        expect.stringContaining('Failed'),
        expect.any(Object),
      );
    });

    it('should log error if vehicle name regeneration fails', async () => {
      mockVehicleCategoryValidationService.validateUpdate.mockResolvedValueOnce(
        {
          ...mockCategory,
          id: '1',
          name: 'Car',
        } as VehicleCategory,
      );

      prisma.vehicleCategory.update.mockResolvedValue({
        id: '1',
        name: 'Truck',
      } as VehicleCategory);

      prisma.vehicle.findMany.mockResolvedValue([
        {
          id: 'v1',
          licensePlate: 'ABC123',
          type: { name: 'Sedan' },
        },
      ]);

      prisma.vehicle.update.mockRejectedValueOnce(new Error('Update failed'));

      await service.update('1', updateDto);

      expect(logger.logError).toHaveBeenCalledWith(
        expect.stringContaining('Failed to update vehicle'),
        expect.any(Object),
      );
    });
  });

  describe('remove', () => {
    it('should delete category successfully', async () => {
      prisma.vehicleCategory.findUnique.mockResolvedValue({
        id: '1',
        name: 'Car',
        types: [],
        vehicles: [],
      });
      prisma.vehicleCategory.delete.mockResolvedValue({ id: '1', name: 'Car' });

      const result = await service.remove('1');

      expect(result).toEqual({ success: true });
      expect(prisma.vehicleCategory.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(logger.logInfo).toHaveBeenCalledWith(
        expect.stringContaining('Deleting'),
        expect.any(Object),
      );
      expect(logger.logInfo).toHaveBeenCalledWith(
        expect.stringContaining('Vehicle category deleted'),
        expect.any(Object),
      );
    });

    it('should throw NotFoundException if category not found', async () => {
      prisma.vehicleCategory.findUnique.mockResolvedValue(null);

      await expect(service.remove('1')).rejects.toThrow(NotFoundException);
      expect(logger.logWarn).toHaveBeenCalledWith(
        expect.stringContaining('Delete failed'),
        expect.any(Object),
      );
    });

    it('should throw ConflictException if category has dependent types', async () => {
      prisma.vehicleCategory.findUnique.mockResolvedValue({
        id: '1',
        name: 'Car',
        types: [{ id: 'type1' }, { id: 'type2' }],
        vehicles: [],
      });

      await expect(service.remove('1')).rejects.toThrow(ConflictException);
      expect(logger.logWarn).toHaveBeenCalledWith(
        expect.stringContaining('Delete failed'),
        expect.any(Object),
      );
    });

    it('should throw ConflictException if category has linked vehicles', async () => {
      prisma.vehicleCategory.findUnique.mockResolvedValue({
        id: '1',
        name: 'Car',
        types: [],
        vehicles: [{ id: 'v1' }, { id: 'v2' }],
      });

      await expect(service.remove('1')).rejects.toThrow(ConflictException);
      expect(logger.logWarn).toHaveBeenCalledWith(
        expect.stringContaining('Delete failed'),
        expect.any(Object),
      );
    });
  });
});
