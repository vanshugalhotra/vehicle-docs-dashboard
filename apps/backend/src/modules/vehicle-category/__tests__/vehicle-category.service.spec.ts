import { VehicleCategoryService } from '../vehicle-category.service';
import { createTestModule } from '../../../../test/utils/test-setup';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { MockedPrisma } from '../../../../test/utils/mock-prisma';
import { MockedLogger } from '../../../../test/utils/mock-logger';
import { VehicleCategoryValidationService } from '../validation/vehicle-category-validation.service';
import { VehicleCategory } from '@prisma/client'; // Import type

const mockCategory: VehicleCategory = {
  id: 'cat1',
  name: 'Car',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockVehicleCategoryValidationService = {
  // 1. validateCreate returns void/null, but we mock resolved value
  validateCreate: jest.fn().mockResolvedValue(null),

  // 2. validateUpdate returns VehicleCategory. Mock the implementation to pass by default.
  validateUpdate: jest.fn().mockImplementation(
    (id: string, name?: string) =>
      ({
        ...mockCategory,
        id,
        name: name ?? mockCategory.name, // Return the provided name or the default mock name
      }) as VehicleCategory,
  ),
};

describe('VehicleCategoryService', () => {
  let service: VehicleCategoryService;
  let prisma: MockedPrisma;
  let logger: MockedLogger;

  beforeEach(async () => {
    jest.clearAllMocks();

    // Reset mock implementations to default values
    mockVehicleCategoryValidationService.validateCreate.mockResolvedValue(null);
    mockVehicleCategoryValidationService.validateUpdate.mockImplementation(
      (id: string, name?: string) =>
        ({
          ...mockCategory,
          id,
          name: name ?? mockCategory.name,
        }) as VehicleCategory,
    );

    // Setup module with the validation service mock
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

  // ────────────────────────────────────────────────
  // CREATE
  // ────────────────────────────────────────────────
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
      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining('Creating'),
      );
    });

    it('should throw ConflictException if exists', async () => {
      // ⚠️ FIX: Mock the validation service to throw the exception
      mockVehicleCategoryValidationService.validateCreate.mockRejectedValueOnce(
        new ConflictException(
          'Vehicle category with name "Car" already exists',
        ),
      );
      // Remove Prisma findFirst mock

      await expect(service.create({ name: 'Car' })).rejects.toThrow(
        ConflictException,
      );
      expect(
        mockVehicleCategoryValidationService.validateCreate,
      ).toHaveBeenCalledWith('Car');
    });
  });

  // ────────────────────────────────────────────────
  // FIND ALL
  // ────────────────────────────────────────────────
  describe('findAll', () => {
    it('should return all categories', async () => {
      prisma.vehicleCategory.findMany.mockResolvedValue([
        { id: '1', name: 'Car' } as VehicleCategory,
      ]);
      const result = await service.findAll({});
      expect(result.items).toHaveLength(1);
    });
  });

  // ────────────────────────────────────────────────
  // FIND ONE
  // ────────────────────────────────────────────────
  describe('findOne', () => {
    it('should return category if exists', async () => {
      prisma.vehicleCategory.findUnique.mockResolvedValue({
        id: '1',
        name: 'Car',
      } as VehicleCategory);
      const result = await service.findOne('1');
      expect(result.id).toBe('1');
    });

    it('should throw NotFoundException if not found', async () => {
      prisma.vehicleCategory.findUnique.mockResolvedValue(null);
      await expect(service.findOne('X')).rejects.toThrow(NotFoundException);
    });
  });

  // ────────────────────────────────────────────────
  // UPDATE
  // ────────────────────────────────────────────────
  describe('update', () => {
    const updateDto = { name: 'Truck' };

    it('should update successfully', async () => {
      // Mock validation service
      mockVehicleCategoryValidationService.validateUpdate.mockResolvedValueOnce(
        {
          ...mockCategory,
          id: '1',
          name: 'Car',
        } as VehicleCategory,
      );

      // Mock category update
      prisma.vehicleCategory.update.mockResolvedValue({
        id: '1',
        name: 'Truck',
      } as VehicleCategory);

      // ✅ Mock vehicles in this category for name regeneration
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

      expect(prisma.vehicleCategory.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { name: updateDto.name },
      });

      expect(prisma.vehicle.findMany).toHaveBeenCalledWith({
        where: { categoryId: '1' },
        include: { type: true },
      });

      expect(prisma.vehicle.update).toHaveBeenCalledTimes(2);

      expect(result.name).toBe('Truck');
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
    });
  });

  // ────────────────────────────────────────────────
  // REMOVE
  // ────────────────────────────────────────────────
  describe('remove', () => {
    it('should delete category', async () => {
      prisma.vehicleCategory.findUnique.mockResolvedValue({
        id: '1',
        name: 'Car',
        types: [],
      });
      prisma.vehicleCategory.delete.mockResolvedValue({ id: '1', name: 'Car' });
      const result = await service.remove('1');
      expect(result).toEqual({ success: true });
      expect(prisma.vehicleCategory.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });
  });
});
