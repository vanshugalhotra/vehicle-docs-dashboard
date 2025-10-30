import { VehicleService } from '../vehicle.service';
import { createTestModule } from '../../../../test/utils/test-setup';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { MockedPrisma } from '../../../../test/utils/mock-prisma';
import { MockedLogger } from '../../../../test/utils/mock-logger';
import { CreateVehicleDto } from '../dto/create-vehicle.dto';
import { UpdateVehicleDto } from '../dto/update-vehicle.dto';
import { mapVehicleToResponse } from '../vehicle.mapper';
import { Vehicle } from '@prisma/client';
import { VehicleValidationService } from '../validation/vehicle-validation.service';

const mockVehicleValidationService = {
  // Use jest.fn() so we can use .mockRejectedValueOnce()
  validateCreate: jest.fn().mockResolvedValue(null),
  validateUpdate: jest.fn(), // Initialize as fn, set implementation in beforeEach
};

jest.mock('../vehicle.mapper', () => ({
  mapVehicleToResponse: jest.fn((v: Partial<Vehicle>) => ({
    id: v.id,
    name: v.name,
    licensePlate: v.licensePlate,
  })),
}));

describe('VehicleService', () => {
  let service: VehicleService;
  let prisma: MockedPrisma;
  let logger: MockedLogger;

  const mockVehicle = {
    id: 'veh-1',
    name: 'Car (Sedan) - AB1234',
    licensePlate: 'AB1234',
    rcNumber: 'RC1234',
    chassisNumber: 'CH1234',
    engineNumber: 'EN1234',
    categoryId: 'cat-1',
    typeId: 'type-1',
    notes: 'Test vehicle',
    ownerId: null,
    driverId: null,
    locationId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockCategory = { id: 'cat-1', name: 'Car' };
  const mockType = { id: 'type-1', name: 'Sedan', categoryId: 'cat-1' };

  beforeEach(async () => {
    // Reset mocks before each test to clear any specific mock implementations
    jest.clearAllMocks();
    // Re-setup the default mock implementations defined above
    mockVehicleValidationService.validateCreate.mockResolvedValue(null);
    mockVehicleValidationService.validateUpdate.mockImplementation(
      (
        id: string,
        licensePlate: string,
        rcNumber: string,
        chassisNumber: string,
        engineNumber: string,
        categoryId: string,
        typeId: string,
      ) => ({
        vehicle: {
          ...mockVehicle,
          id, // Override ID with the one passed to the function
          licensePlate: licensePlate || mockVehicle.licensePlate,
          rcNumber: rcNumber || mockVehicle.rcNumber,
          chassisNumber: chassisNumber || mockVehicle.chassisNumber,
          engineNumber: engineNumber || mockVehicle.engineNumber,
          categoryId: categoryId || mockVehicle.categoryId,
          typeId: typeId || mockVehicle.typeId,
        },
        category: mockCategory,
        type: mockType,
      }),
    );
    const setup = await createTestModule(VehicleService, [
      {
        provide: VehicleValidationService,
        useValue: mockVehicleValidationService,
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
    const dto: CreateVehicleDto = {
      licensePlate: 'ab1234',
      rcNumber: 'rc1234',
      chassisNumber: 'ch1234',
      engineNumber: 'en1234',
      categoryId: 'cat-1',
      typeId: 'type-1',
      ownerId: undefined,
      driverId: undefined,
      locationId: undefined,
      notes: 'Test vehicle',
    };

    it('should create a new vehicle successfully', async () => {
      // prisma.vehicle.findFirst.mockResolvedValue(null); // This check is now in validation mock
      prisma.vehicle.create.mockResolvedValue(mockVehicle);

      // Mocks needed for name generation within the service, before validation
      prisma.vehicleCategory.findUnique.mockResolvedValue(mockCategory);
      prisma.vehicleType.findUnique.mockResolvedValue(mockType);

      const result = await service.create(dto);

      expect(mockVehicleValidationService.validateCreate).toHaveBeenCalledTimes(
        1,
      ); // Validation is now mocked
      expect(mapVehicleToResponse).toHaveBeenCalledWith(mockVehicle);
      expect(result.licensePlate).toBe('AB1234');
      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining('Create'),
      );
    });

    it('should throw ConflictException if identifiers conflict', async () => {
      // ⚠️ FIX: Mock the validation service to throw the exception
      mockVehicleValidationService.validateCreate.mockRejectedValueOnce(
        new ConflictException('Vehicle identifier conflict'),
      );
      // prisma.vehicle.findFirst.mockResolvedValue(mockVehicle); // Old Prisma mock removed

      await expect(service.create(dto)).rejects.toThrow(ConflictException);
    });

    it('should throw NotFoundException if category missing', async () => {
      // ⚠️ FIX: Mock the validation service to throw the exception
      mockVehicleValidationService.validateCreate.mockRejectedValueOnce(
        new NotFoundException('Category not found'),
      );

      // Old Prisma mocks removed/ignored

      await expect(service.create(dto)).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if type missing', async () => {
      // ⚠️ FIX: Mock the validation service to throw the exception
      mockVehicleValidationService.validateCreate.mockRejectedValueOnce(
        new NotFoundException('Type not found'),
      );

      // Old Prisma mocks removed/ignored

      await expect(service.create(dto)).rejects.toThrow(NotFoundException);
    });
  });

  // ----------------------------------------------------------------
  // FIND ALL
  // ----------------------------------------------------------------
  describe('findAll', () => {
    it('should return paginated list of vehicles', async () => {
      prisma.vehicle.findMany.mockResolvedValue([mockVehicle]);

      const result = await service.findAll({ skip: 0, take: 10 });

      expect(prisma.vehicle.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 0,
          take: 10,
        }),
      );
      expect(result.items).toHaveLength(1);
      expect(result.items[0].licensePlate).toBe('AB1234');
      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining('Fetched'),
      );
    });

    it('should apply filters correctly', async () => {
      prisma.vehicle.findMany.mockResolvedValue([mockVehicle]);
      await service.findAll({});
    });
  });

  // ----------------------------------------------------------------
  // FIND ONE
  // ----------------------------------------------------------------
  describe('findOne', () => {
    it('should return a vehicle if found', async () => {
      prisma.vehicle.findUnique.mockResolvedValue(mockVehicle);
      const result = await service.findOne('veh-1');

      expect(prisma.vehicle.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'veh-1' } }),
      );
      expect(result.id).toBe('veh-1');
    });

    it('should throw NotFoundException if not found', async () => {
      prisma.vehicle.findUnique.mockResolvedValue(null);
      await expect(service.findOne('missing')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ----------------------------------------------------------------
  // UPDATE
  // ----------------------------------------------------------------
  describe('update', () => {
    const dto: UpdateVehicleDto = { licensePlate: 'NEW123' };

    it('should update vehicle successfully', async () => {
      // NOTE: validateUpdate is mocked to pass by default
      prisma.vehicle.update.mockResolvedValue({
        ...mockVehicle,
        licensePlate: 'NEW123',
      });

      // Mocks needed for name generation within the service
      prisma.vehicleCategory.findUnique.mockResolvedValue(mockCategory);
      prisma.vehicleType.findUnique.mockResolvedValue(mockType);

      const result = await service.update('veh-1', dto);

      expect(mockVehicleValidationService.validateUpdate).toHaveBeenCalledTimes(
        1,
      );
      expect(prisma.vehicle.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'veh-1' } }),
      );
      expect(result.licensePlate).toBe('NEW123');
      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining('Updated'),
      );
    });

    it('should throw NotFoundException if vehicle not found', async () => {
      // ⚠️ FIX: Mock the validation service to throw the exception
      mockVehicleValidationService.validateUpdate.mockRejectedValueOnce(
        new NotFoundException('Vehicle not found'),
      );

      await expect(service.update('missing', dto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ConflictException if identifier conflict', async () => {
      // ⚠️ FIX: Mock the validation service to throw the exception
      mockVehicleValidationService.validateUpdate.mockRejectedValueOnce(
        new ConflictException('Identifier conflict'),
      );

      // Old Prisma mocks removed/ignored

      await expect(service.update('veh-1', dto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should regenerate name when category/type/plate changes', async () => {
      // NOTE: validateUpdate is mocked to pass by default
      prisma.vehicle.update.mockResolvedValue(mockVehicle);

      // Mocks needed for name generation within the service
      prisma.vehicleCategory.findUnique.mockResolvedValue(mockCategory);
      prisma.vehicleType.findUnique.mockResolvedValue(mockType);

      await service.update('veh-1', {
        categoryId: 'cat-1',
        typeId: 'type-1',
        licensePlate: 'NEW123',
      });

      expect(mockVehicleValidationService.validateUpdate).toHaveBeenCalledTimes(
        1,
      );
    });
  });

  // ----------------------------------------------------------------
  // REMOVE
  // ----------------------------------------------------------------
  describe('remove', () => {
    it('should delete vehicle successfully', async () => {
      prisma.vehicle.findUnique.mockResolvedValue(mockVehicle);
      prisma.vehicle.delete.mockResolvedValue(mockVehicle);

      const result = await service.remove('veh-1');

      expect(result).toEqual({ success: true });
      expect(prisma.vehicle.delete).toHaveBeenCalledWith({
        where: { id: 'veh-1' },
      });
      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining('Deleted'),
      );
    });

    it('should throw NotFoundException if vehicle not found', async () => {
      prisma.vehicle.findUnique.mockResolvedValue(null);
      await expect(service.remove('veh-404')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
