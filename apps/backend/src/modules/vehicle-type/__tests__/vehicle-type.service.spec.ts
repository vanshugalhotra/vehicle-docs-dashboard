import { VehicleTypeService } from '../vehicle-type.service';
import { createTestModule } from '../../../../test/utils/test-setup';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { MockedPrisma } from '../../../../test/utils/mock-prisma';
import { MockedLogger } from '../../../../test/utils/mock-logger';
import { VehicleTypeValidationService } from '../validation/vehicle-type-validation.service';
import { VehicleType } from '@prisma/client'; // Import needed types

// --- Mock Definitions ---
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
  // 1. validateCreate returns a VehicleCategory
  validateCreate: jest.fn().mockResolvedValue(mockCategory),

  // 2. validateUpdate returns { vehicleType, category }
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

    // Reset mock implementations to default values
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

  // ----------------------------------------------------------------
  // CREATE
  // ----------------------------------------------------------------
  describe('create', () => {
    const createDto = { name: 'Sedan', categoryId: 'cat1' };

    it('should create vehicle type successfully', async () => {
      // NOTE: Prisma mocks for existence/category check are removed, validation mock handles this.
      prisma.vehicleType.create.mockResolvedValue(mockVehicleType);

      const result = await service.create(createDto);

      expect(
        mockVehicleTypeValidationService.validateCreate,
      ).toHaveBeenCalledWith(createDto.name, createDto.categoryId);
      expect(result.name).toBe('Sedan');
      expect(logger.info).toHaveBeenCalled();
    });

    it('should throw NotFoundException if category not found', async () => {
      // ⚠️ FIX: Mock the validation service to throw the exception
      mockVehicleTypeValidationService.validateCreate.mockRejectedValueOnce(
        new NotFoundException('Vehicle category with id "catX" not found'),
      );
      // Remove prisma.vehicleCategory.findUnique mock

      await expect(
        service.create({ name: 'SUV', categoryId: 'catX' }),
      ).rejects.toThrow(NotFoundException);

      expect(
        mockVehicleTypeValidationService.validateCreate,
      ).toHaveBeenCalled();
    });

    it('should throw ConflictException if duplicate name exists in category', async () => {
      // ⚠️ FIX: Mock the validation service to throw the exception
      mockVehicleTypeValidationService.validateCreate.mockRejectedValueOnce(
        new ConflictException(
          'Vehicle type "Sedan" already exists under this category',
        ),
      );
      // Remove prisma.vehicleType.findFirst mock

      await expect(service.create(createDto)).rejects.toThrow(
        ConflictException,
      );

      expect(
        mockVehicleTypeValidationService.validateCreate,
      ).toHaveBeenCalled();
    });
  });

  // ----------------------------------------------------------------
  // FIND ALL
  // ----------------------------------------------------------------
  describe('findAll', () => {
    it('should list all vehicle types', async () => {
      prisma.vehicleType.findMany.mockResolvedValue([
        { ...mockVehicleType, id: '1' },
      ]);
      const result = await service.findAll({});
      expect(result.items).toHaveLength(1);
    });
  });

  // ----------------------------------------------------------------
  // UPDATE
  // ----------------------------------------------------------------
  describe('update', () => {
    const updateDto = { name: 'SUV' };

    it('should update vehicle type successfully', async () => {
      // NOTE: validateUpdate mock (in beforeEach) handles existence and uniqueness.
      // Remove prisma.vehicleType.findUnique/findFirst mocks.
      prisma.vehicleType.update.mockResolvedValue({
        ...mockVehicleType,
        id: '1',
        name: 'SUV',
      });

      const result = await service.update('1', updateDto);

      expect(
        mockVehicleTypeValidationService.validateUpdate,
      ).toHaveBeenCalledWith(
        '1',
        updateDto.name,
        undefined, // categoryId is undefined in DTO
      );
      expect(result.name).toBe('SUV');
    });

    it('should throw ConflictException if duplicate name exists', async () => {
      // ⚠️ FIX: Mock the validation service to throw ConflictException
      mockVehicleTypeValidationService.validateUpdate.mockRejectedValueOnce(
        new ConflictException(
          'Vehicle type "SUV" already exists under this category',
        ),
      );
      // Remove prisma.vehicleType.findUnique/findFirst mocks

      await expect(service.update('1', updateDto)).rejects.toThrow(
        ConflictException,
      );
      expect(
        mockVehicleTypeValidationService.validateUpdate,
      ).toHaveBeenCalled();
    });

    it('should throw NotFoundException if vehicle type not found', async () => {
      // ⚠️ FIX: Mock the validation service to throw NotFoundException
      mockVehicleTypeValidationService.validateUpdate.mockRejectedValueOnce(
        new NotFoundException('Vehicle type with id "404" not found'),
      );
      // Remove prisma.vehicleType.findUnique mock

      await expect(service.update('404', updateDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(
        mockVehicleTypeValidationService.validateUpdate,
      ).toHaveBeenCalled();
    });

    it('should throw NotFoundException if new category not found', async () => {
      // ⚠️ FIX: Mock the validation service to throw NotFoundException
      mockVehicleTypeValidationService.validateUpdate.mockRejectedValueOnce(
        new NotFoundException('Vehicle category with id "catX" not found'),
      );

      await expect(service.update('1', { categoryId: 'catX' })).rejects.toThrow(
        NotFoundException,
      );
      expect(
        mockVehicleTypeValidationService.validateUpdate,
      ).toHaveBeenCalled();
    });
  });

  // ----------------------------------------------------------------
  // REMOVE
  // ----------------------------------------------------------------
  describe('remove', () => {
    it('should delete vehicle type', async () => {
      prisma.vehicleType.findUnique.mockResolvedValue(mockVehicleType);
      // NOTE: The vehicle count check is assumed to be in the service method logic, not validation.
      prisma.vehicleType.delete.mockResolvedValue(mockVehicleType);

      const result = await service.remove('1');

      expect(result.success).toBe(true);
      expect(prisma.vehicleType.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('should throw NotFoundException if vehicle type not found', async () => {
      prisma.vehicleType.findUnique.mockResolvedValue(null);
      await expect(service.remove('404')).rejects.toThrow(NotFoundException);
    });
  });
});
