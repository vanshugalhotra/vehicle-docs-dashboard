import { VehicleTypeService } from '../vehicle-type.service';
import { createTestModule } from '../../../../test/utils/test-setup';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { MockedPrisma } from '../../../../test/utils/mock-prisma';
import { MockedLogger } from '../../../../test/utils/mock-logger';
import { VehicleTypeValidationService } from '../validation/vehicle-type-validation.service';
import { VehicleType } from '@prisma/client';

const mockCategory = { id: 'cat1', name: 'Car' };
const mockVehicleType = {
  id: 'type1',
  name: 'Sedan',
  categoryId: 'cat1',
  vehicles: [],
  createdAt: new Date(),
  updatedAt: new Date(),
} as VehicleType;

const mockVehicleTypeValidationService = {
  validateCreate: jest.fn().mockResolvedValue(mockCategory),
  validateUpdate: jest
    .fn()
    .mockImplementation((id: string, name?: string, categoryId?: string) => ({
      vehicleType: {
        ...mockVehicleType,
        id,
        name: name ?? mockVehicleType.name,
        categoryId: categoryId ?? mockVehicleType.categoryId,
      } as VehicleType,
      category: mockCategory,
    })),
};

describe('VehicleTypeService', () => {
  let service: VehicleTypeService;
  let prisma: MockedPrisma;
  let logger: MockedLogger;

  beforeEach(async () => {
    jest.clearAllMocks();
    mockVehicleTypeValidationService.validateCreate.mockResolvedValue(
      mockCategory,
    );
    mockVehicleTypeValidationService.validateUpdate.mockImplementation(
      (id: string, name?: string, categoryId?: string) => ({
        vehicleType: {
          ...mockVehicleType,
          id,
          name: name ?? mockVehicleType.name,
          categoryId: categoryId ?? mockVehicleType.categoryId,
        } as VehicleType,
        category: mockCategory,
      }),
    );

    const setup = await createTestModule(VehicleTypeService, [
      {
        provide: VehicleTypeValidationService,
        useValue: mockVehicleTypeValidationService,
      },
    ]);
    service = setup.service;
    prisma = setup.mocks.prisma;
    logger = setup.mocks.logger;
  });

  afterEach(() => jest.clearAllMocks());

  describe('create', () => {
    const createDto = { name: 'Sedan', categoryId: 'cat1' };

    it('should create vehicle type successfully', async () => {
      prisma.vehicleType.create.mockResolvedValue(mockVehicleType);

      const result = await service.create(createDto);

      expect(
        mockVehicleTypeValidationService.validateCreate,
      ).toHaveBeenCalledWith(createDto.name, createDto.categoryId);
      expect(result.name).toBe('Sedan');
      expect(logger.logInfo).toHaveBeenCalledWith(
        expect.stringContaining('Creating'),
        expect.any(Object),
      );
      expect(logger.logInfo).toHaveBeenCalledWith(
        expect.stringContaining('Vehicle type created'),
        expect.any(Object),
      );
    });

    it('should throw NotFoundException if category not found', async () => {
      mockVehicleTypeValidationService.validateCreate.mockRejectedValueOnce(
        new NotFoundException('Vehicle category with id "catX" not found'),
      );

      await expect(
        service.create({ name: 'SUV', categoryId: 'catX' }),
      ).rejects.toThrow(NotFoundException);

      expect(
        mockVehicleTypeValidationService.validateCreate,
      ).toHaveBeenCalled();
      expect(logger.logError).toHaveBeenCalledWith(
        expect.stringContaining('Failed'),
        expect.any(Object),
      );
    });

    it('should throw ConflictException if duplicate name exists in category', async () => {
      mockVehicleTypeValidationService.validateCreate.mockRejectedValueOnce(
        new ConflictException(
          'Vehicle type "Sedan" already exists under this category',
        ),
      );

      await expect(service.create(createDto)).rejects.toThrow(
        ConflictException,
      );
      expect(
        mockVehicleTypeValidationService.validateCreate,
      ).toHaveBeenCalled();
      expect(logger.logError).toHaveBeenCalledWith(
        expect.stringContaining('Failed'),
        expect.any(Object),
      );
    });
  });

  describe('findAll', () => {
    it('should list all vehicle types', async () => {
      prisma.vehicleType.findMany.mockResolvedValue([
        { ...mockVehicleType, id: '1', category: mockCategory },
      ]);
      prisma.vehicleType.count.mockResolvedValue(1);

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
    it('should return vehicle type if found', async () => {
      prisma.vehicleType.findUnique.mockResolvedValue({
        ...mockVehicleType,
        category: mockCategory,
      });

      const result = await service.findOne('type1');

      expect(result.name).toBe('Sedan');
      expect(logger.logInfo).toHaveBeenCalledWith(
        expect.stringContaining('Fetching'),
        expect.any(Object),
      );
    });

    it('should throw NotFoundException if not found', async () => {
      prisma.vehicleType.findUnique.mockResolvedValue(null);

      await expect(service.findOne('missing')).rejects.toThrow(
        NotFoundException,
      );
      expect(logger.logWarn).toHaveBeenCalledWith(
        expect.stringContaining('not found'),
        expect.any(Object),
      );
    });
  });

  describe('update', () => {
    const updateDto = { name: 'SUV' };

    it('should update vehicle type successfully', async () => {
      mockVehicleTypeValidationService.validateUpdate.mockResolvedValueOnce({
        vehicleType: {
          ...mockVehicleType,
          id: '1',
          name: 'Sedan',
          categoryId: 'cat1',
        },
        category: mockCategory,
      });

      prisma.vehicleType.update.mockResolvedValue({
        id: '1',
        name: 'SUV',
        categoryId: 'cat1',
        category: { ...mockCategory, name: 'Car' },
      });

      prisma.vehicle.findMany.mockResolvedValue([
        {
          id: 'v1',
          licensePlate: 'ABC123',
          category: { ...mockCategory, name: 'Car' },
        },
        {
          id: 'v2',
          licensePlate: 'XYZ789',
          category: { ...mockCategory, name: 'Car' },
        },
      ]);

      prisma.vehicle.update.mockImplementation(
        async ({
          where,
          data,
        }: {
          where: { id: string };
          data: { name: string };
        }) => Promise.resolve({ id: where.id, name: data.name }),
      );

      const result = await service.update('1', updateDto);

      expect(
        mockVehicleTypeValidationService.validateUpdate,
      ).toHaveBeenCalledWith('1', updateDto.name, undefined);
      expect(result.name).toBe('SUV');
      expect(logger.logInfo).toHaveBeenCalledWith(
        expect.stringContaining('Updating'),
        expect.any(Object),
      );
      expect(logger.logInfo).toHaveBeenCalledWith(
        expect.stringContaining('Vehicle type updated'),
        expect.any(Object),
      );
    });

    it('should throw ConflictException if duplicate name exists', async () => {
      mockVehicleTypeValidationService.validateUpdate.mockRejectedValueOnce(
        new ConflictException(
          'Vehicle type "SUV" already exists under this category',
        ),
      );

      await expect(service.update('1', updateDto)).rejects.toThrow(
        ConflictException,
      );
      expect(
        mockVehicleTypeValidationService.validateUpdate,
      ).toHaveBeenCalled();
      expect(logger.logError).toHaveBeenCalledWith(
        expect.stringContaining('Failed'),
        expect.any(Object),
      );
    });

    it('should throw NotFoundException if vehicle type not found', async () => {
      mockVehicleTypeValidationService.validateUpdate.mockRejectedValueOnce(
        new NotFoundException('Vehicle type with id "404" not found'),
      );

      await expect(service.update('404', updateDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(
        mockVehicleTypeValidationService.validateUpdate,
      ).toHaveBeenCalled();
      expect(logger.logError).toHaveBeenCalledWith(
        expect.stringContaining('Failed'),
        expect.any(Object),
      );
    });

    it('should throw NotFoundException if new category not found', async () => {
      mockVehicleTypeValidationService.validateUpdate.mockRejectedValueOnce(
        new NotFoundException('Vehicle category with id "catX" not found'),
      );

      await expect(service.update('1', { categoryId: 'catX' })).rejects.toThrow(
        NotFoundException,
      );
      expect(
        mockVehicleTypeValidationService.validateUpdate,
      ).toHaveBeenCalled();
      expect(logger.logError).toHaveBeenCalledWith(
        expect.stringContaining('Failed'),
        expect.any(Object),
      );
    });

    it('should log error if vehicle name regeneration fails', async () => {
      mockVehicleTypeValidationService.validateUpdate.mockResolvedValueOnce({
        vehicleType: { ...mockVehicleType, id: '1' },
        category: mockCategory,
      });

      prisma.vehicleType.update.mockResolvedValue({
        id: '1',
        name: 'SUV',
        categoryId: 'cat1',
        category: mockCategory,
      });

      prisma.vehicle.findMany.mockResolvedValue([
        {
          id: 'v1',
          licensePlate: 'ABC123',
          category: mockCategory,
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
    it('should delete vehicle type', async () => {
      prisma.vehicleType.findUnique.mockResolvedValue(mockVehicleType);
      prisma.vehicleType.delete.mockResolvedValue(mockVehicleType);

      const result = await service.remove('1');

      expect(result.success).toBe(true);
      expect(prisma.vehicleType.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(logger.logInfo).toHaveBeenCalledWith(
        expect.stringContaining('Deleting'),
        expect.any(Object),
      );
      expect(logger.logInfo).toHaveBeenCalledWith(
        expect.stringContaining('Vehicle type deleted'),
        expect.any(Object),
      );
    });

    it('should throw NotFoundException if vehicle type not found', async () => {
      prisma.vehicleType.findUnique.mockResolvedValue(null);

      await expect(service.remove('404')).rejects.toThrow(NotFoundException);
      expect(logger.logWarn).toHaveBeenCalledWith(
        expect.stringContaining('not found'),
        expect.any(Object),
      );
    });

    it('should throw ConflictException if vehicles exist', async () => {
      const typeWithVehicles = {
        ...mockVehicleType,
        vehicles: [{ id: 'v1' }, { id: 'v2' }] as any[],
      };

      prisma.vehicleType.findUnique.mockResolvedValue(typeWithVehicles);

      await expect(service.remove('1')).rejects.toThrow(ConflictException);
      expect(logger.logWarn).toHaveBeenCalledWith(
        expect.stringContaining('Cannot delete'),
        expect.any(Object),
      );
    });
  });
});
