import { VehicleService } from '../vehicle.service';
import { createTestModule } from '../../../../test/utils/test-setup';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { MockedPrisma } from '../../../../test/utils/mock-prisma';
import { MockedLogger } from '../../../../test/utils/mock-logger';
import { CreateVehicleDto } from '../dto/create-vehicle.dto';
import { UpdateVehicleDto } from '../dto/update-vehicle.dto';
import { Vehicle } from '@prisma/client';
import { VehicleValidationService } from '../validation/vehicle-validation.service';

const mockVehicleValidationService = {
  validateCreate: jest.fn().mockResolvedValue(null),
  validateUpdate: jest.fn(),
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
    jest.clearAllMocks();
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
          id,
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
      prisma.vehicle.create.mockResolvedValue(mockVehicle);
      prisma.vehicleCategory.findUnique.mockResolvedValue(mockCategory);
      prisma.vehicleType.findUnique.mockResolvedValue(mockType);

      const result = await service.create(dto);

      expect(mockVehicleValidationService.validateCreate).toHaveBeenCalledTimes(
        1,
      );
      expect(result.licensePlate).toBe('AB1234');
      expect(logger.logInfo).toHaveBeenCalledWith(
        expect.stringContaining('Creating'),
        expect.any(Object),
      );
      expect(logger.logInfo).toHaveBeenCalledWith(
        expect.stringContaining('Vehicle created'),
        expect.any(Object),
      );
    });

    it('should throw ConflictException if identifiers conflict', async () => {
      mockVehicleValidationService.validateCreate.mockRejectedValueOnce(
        new ConflictException('Vehicle identifier conflict'),
      );

      await expect(service.create(dto)).rejects.toThrow(ConflictException);
      expect(logger.logError).toHaveBeenCalledWith(
        expect.stringContaining('Error'),
        expect.any(Object),
      );
    });

    it('should throw NotFoundException if category missing', async () => {
      mockVehicleValidationService.validateCreate.mockRejectedValueOnce(
        new NotFoundException('Category not found'),
      );

      await expect(service.create(dto)).rejects.toThrow(NotFoundException);
      expect(logger.logError).toHaveBeenCalledWith(
        expect.stringContaining('Error'),
        expect.any(Object),
      );
    });

    it('should throw NotFoundException if type missing', async () => {
      mockVehicleValidationService.validateCreate.mockRejectedValueOnce(
        new NotFoundException('Type not found'),
      );

      await expect(service.create(dto)).rejects.toThrow(NotFoundException);
      expect(logger.logError).toHaveBeenCalledWith(
        expect.stringContaining('Error'),
        expect.any(Object),
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated list of vehicles', async () => {
      prisma.vehicle.findMany.mockResolvedValue([mockVehicle]);
      prisma.vehicle.count.mockResolvedValue(1);

      const result = await service.findAll({ skip: 0, take: 10 });

      expect(prisma.vehicle.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 0,
          take: 10,
        }),
      );
      expect(result.items).toHaveLength(1);
      expect(result.items[0].licensePlate).toBe('AB1234');
      expect(logger.logInfo).toHaveBeenCalledWith(
        expect.stringContaining('Fetching'),
        expect.any(Object),
      );
      expect(logger.logInfo).toHaveBeenCalledWith(
        expect.stringContaining('Vehicles fetched'),
        expect.any(Object),
      );
    });

    it('should apply filters correctly', async () => {
      prisma.vehicle.findMany.mockResolvedValue([mockVehicle]);
      prisma.vehicle.count.mockResolvedValue(1);

      await service.findAll({});

      expect(logger.logInfo).toHaveBeenCalledWith(
        expect.stringContaining('Fetching'),
        expect.any(Object),
      );
    });
  });

  describe('findOne', () => {
    it('should return a vehicle if found', async () => {
      prisma.vehicle.findUnique.mockResolvedValue(mockVehicle);

      const result = await service.findOne('veh-1');

      expect(prisma.vehicle.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'veh-1' } }),
      );
      expect(result.id).toBe('veh-1');
      expect(logger.logInfo).toHaveBeenCalledWith(
        expect.stringContaining('Fetching'),
        expect.any(Object),
      );
    });

    it('should throw NotFoundException if not found', async () => {
      prisma.vehicle.findUnique.mockResolvedValue(null);

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
    const dto: UpdateVehicleDto = { licensePlate: 'NEW123' };

    it('should update vehicle successfully', async () => {
      prisma.vehicle.update.mockResolvedValue({
        ...mockVehicle,
        licensePlate: 'NEW123',
      });
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
      expect(logger.logInfo).toHaveBeenCalledWith(
        expect.stringContaining('Updating'),
        expect.any(Object),
      );
      expect(logger.logInfo).toHaveBeenCalledWith(
        expect.stringContaining('Vehicle updated'),
        expect.any(Object),
      );
    });

    it('should throw NotFoundException if vehicle not found', async () => {
      mockVehicleValidationService.validateUpdate.mockRejectedValueOnce(
        new NotFoundException('Vehicle not found'),
      );

      await expect(service.update('missing', dto)).rejects.toThrow(
        NotFoundException,
      );
      expect(logger.logError).toHaveBeenCalledWith(
        expect.stringContaining('Error'),
        expect.any(Object),
      );
    });

    it('should throw ConflictException if identifier conflict', async () => {
      mockVehicleValidationService.validateUpdate.mockRejectedValueOnce(
        new ConflictException('Identifier conflict'),
      );

      await expect(service.update('veh-1', dto)).rejects.toThrow(
        ConflictException,
      );
      expect(logger.logError).toHaveBeenCalledWith(
        expect.stringContaining('Error'),
        expect.any(Object),
      );
    });

    it('should regenerate name when category/type/plate changes', async () => {
      prisma.vehicle.update.mockResolvedValue(mockVehicle);
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
      expect(logger.logInfo).toHaveBeenCalledWith(
        expect.stringContaining('Updating'),
        expect.any(Object),
      );
    });
  });

  describe('remove', () => {
    it('should delete vehicle successfully', async () => {
      prisma.vehicle.findUnique.mockResolvedValue(mockVehicle);
      prisma.vehicleDocument.count.mockResolvedValue(0);
      prisma.vehicle.delete.mockResolvedValue(mockVehicle);

      const result = await service.remove('veh-1');

      expect(result).toEqual({ success: true });
      expect(prisma.vehicle.delete).toHaveBeenCalledWith({
        where: { id: 'veh-1' },
      });
      expect(logger.logInfo).toHaveBeenCalledWith(
        expect.stringContaining('Deleting'),
        expect.any(Object),
      );
      expect(logger.logInfo).toHaveBeenCalledWith(
        expect.stringContaining('Vehicle deleted'),
        expect.any(Object),
      );
    });

    it('should throw NotFoundException if vehicle not found', async () => {
      prisma.vehicle.findUnique.mockResolvedValue(null);

      await expect(service.remove('veh-404')).rejects.toThrow(
        NotFoundException,
      );
      expect(logger.logWarn).toHaveBeenCalledWith(
        expect.stringContaining('not found'),
        expect.any(Object),
      );
    });

    it('should throw ConflictException if linked documents exist', async () => {
      prisma.vehicle.findUnique.mockResolvedValue(mockVehicle);
      prisma.vehicleDocument.count.mockResolvedValue(3);

      await expect(service.remove('veh-1')).rejects.toThrow(ConflictException);
      expect(logger.logWarn).toHaveBeenCalledWith(
        expect.stringContaining('Delete failed'),
        expect.any(Object),
      );
    });
  });
});
