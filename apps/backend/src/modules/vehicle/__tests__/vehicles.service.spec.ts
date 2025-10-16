import { VehiclesService } from '../vehicles.service';
import { createTestModule } from '../../../../test/utils/test-setup';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { MockedPrisma } from '../../../../test/utils/mock-prisma';
import { MockedLogger } from '../../../../test/utils/mock-logger';
import { CreateVehicleDto } from '../dto/create-vehicle.dto';
import { UpdateVehicleDto } from '../dto/update-vehicle.dto';
import { mapVehicleToResponse } from '../vehicles.mapper';
import { Vehicle } from '@prisma/client';

jest.mock('../vehicles.mapper', () => ({
  mapVehicleToResponse: jest.fn((v: Partial<Vehicle>) => ({
    id: v.id,
    name: v.name,
    licensePlate: v.licensePlate,
  })),
}));

describe('VehiclesService', () => {
  let service: VehiclesService;
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
    const setup = await createTestModule(VehiclesService);
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
      prisma.vehicle.findFirst.mockResolvedValue(null);
      prisma.vehicleCategory.findUnique.mockResolvedValue(mockCategory);
      prisma.vehicleType.findUnique.mockResolvedValue(mockType);
      prisma.vehicle.create.mockResolvedValue(mockVehicle);

      const result = await service.create(dto);

      expect(prisma.vehicle.findFirst).toHaveBeenCalledTimes(1);
      expect(mapVehicleToResponse).toHaveBeenCalledWith(mockVehicle);
      expect(result.licensePlate).toBe('AB1234');
      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining('Create'),
      );
    });

    it('should throw ConflictException if identifiers conflict', async () => {
      prisma.vehicle.findFirst.mockResolvedValue(mockVehicle);

      await expect(service.create(dto)).rejects.toThrow(ConflictException);
      expect(logger.warn).toHaveBeenCalled();
    });

    it('should throw NotFoundException if category missing', async () => {
      prisma.vehicle.findFirst.mockResolvedValue(null);
      prisma.vehicleCategory.findUnique.mockResolvedValue(null);
      prisma.vehicleType.findUnique.mockResolvedValue(mockType);

      await expect(service.create(dto)).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if type missing', async () => {
      prisma.vehicle.findFirst.mockResolvedValue(null);
      prisma.vehicleCategory.findUnique.mockResolvedValue(mockCategory);
      prisma.vehicleType.findUnique.mockResolvedValue(null);

      await expect(service.create(dto)).rejects.toThrow(NotFoundException);
    });
  });

  // ----------------------------------------------------------------
  // FIND ALL
  // ----------------------------------------------------------------
  describe('findAll', () => {
    it('should return paginated list of vehicles', async () => {
      prisma.vehicle.findMany.mockResolvedValue([mockVehicle]);

      const result = await service.findAll(0, 10);

      expect(prisma.vehicle.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {},
          skip: 0,
          take: 10,
        }),
      );
      expect(result).toHaveLength(1);
      expect(result[0].licensePlate).toBe('AB1234');
      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining('Fetched'),
      );
    });

    it('should apply filters correctly', async () => {
      prisma.vehicle.findMany.mockResolvedValue([mockVehicle]);
      const filter = { categoryId: 'cat-1' };
      await service.findAll(0, 5, filter);

      expect(prisma.vehicle.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: filter,
          skip: 0,
          take: 5,
        }),
      );
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
      prisma.vehicle.findUnique.mockResolvedValue(mockVehicle);
      prisma.vehicle.findFirst.mockResolvedValue(null);
      prisma.vehicleCategory.findUnique.mockResolvedValue(mockCategory);
      prisma.vehicleType.findUnique.mockResolvedValue(mockType);
      prisma.vehicle.update.mockResolvedValue({
        ...mockVehicle,
        licensePlate: 'NEW123',
      });

      const result = await service.update('veh-1', dto);

      expect(prisma.vehicle.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'veh-1' } }),
      );
      expect(result.licensePlate).toBe('NEW123');
      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining('Updated'),
      );
    });

    it('should throw NotFoundException if vehicle not found', async () => {
      prisma.vehicle.findUnique.mockResolvedValue(null);
      await expect(service.update('missing', dto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ConflictException if identifier conflict', async () => {
      prisma.vehicle.findUnique.mockResolvedValue(mockVehicle);
      prisma.vehicle.findFirst.mockResolvedValue({ id: 'veh-2' });
      await expect(service.update('veh-1', dto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should regenerate name when category/type/plate changes', async () => {
      prisma.vehicle.findUnique.mockResolvedValue(mockVehicle);
      prisma.vehicle.findFirst.mockResolvedValue(null);
      prisma.vehicleCategory.findUnique.mockResolvedValue(mockCategory);
      prisma.vehicleType.findUnique.mockResolvedValue(mockType);
      prisma.vehicle.update.mockResolvedValue(mockVehicle);

      await service.update('veh-1', {
        categoryId: 'cat-1',
        typeId: 'type-1',
        licensePlate: 'NEW123',
      });

      expect(prisma.vehicleCategory.findUnique).toHaveBeenCalled();
      expect(prisma.vehicleType.findUnique).toHaveBeenCalled();
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
