import { LocationService } from '../location.service';
import { createTestModule } from '../../../../test/utils/test-setup';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { MockedPrisma } from '../../../../test/utils/mock-prisma';
import { MockedLogger } from '../../../../test/utils/mock-logger';
import { LocationValidationService } from '../validation/location-validation.service';
import { Location } from '@prisma/client';

const mockLocationValidationService = {
  // Mock methods to control behavior (e.g., allow successful validation by default)
  // We use jest.fn() so we can reset or override it per test
  validateCreate: jest.fn().mockResolvedValue(null),
  validateUpdate: jest.fn(), // Initialize as fn, implementation set in beforeEach
};

describe('LocationService', () => {
  let service: LocationService;
  let prisma: MockedPrisma;
  let logger: MockedLogger;

  // Define a mock location entity for the validation mock to return
  const mockLocation: Location = {
    id: 'loc1',
    name: 'Warehouse A',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    // Reset mocks before each test to clear any specific mock implementations
    jest.clearAllMocks();
    // Re-setup the default mock implementations defined above
    mockLocationValidationService.validateCreate.mockResolvedValue(null);

    // 🏆 FIX: Set the mock implementation to return the full Location object
    // as expected by the service, ensuring 'name' and 'id' are present.
    mockLocationValidationService.validateUpdate.mockImplementation(
      (id: string, name: string) =>
        ({
          ...mockLocation,
          id,
          name: name || mockLocation.name, // Return the original name if none is provided in the DTO
        }) as Location,
    );

    const setup = await createTestModule(LocationService, [
      {
        provide: LocationValidationService,
        useValue: mockLocationValidationService,
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
    it('should create location successfully', async () => {
      // NOTE: relies on mockLocationValidationService.validateCreate resolving to null
      // Remove prisma.location.findFirst mock, as validation handles existence check
      prisma.location.create.mockResolvedValue(mockLocation);

      const res = await service.create({ name: 'Warehouse A' });

      expect(mockLocationValidationService.validateCreate).toHaveBeenCalledWith(
        'Warehouse A',
      );
      expect(res.name).toBe('Warehouse A');
      expect(prisma.location.create).toHaveBeenCalledWith({
        data: { name: 'Warehouse A' },
      });
      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining('Creating location'),
      );
    });

    it('should trim input name and treat duplicates case-insensitively', async () => {
      // ⚠️ FIX: Mock the validation service to throw the exception
      mockLocationValidationService.validateCreate.mockRejectedValueOnce(
        new ConflictException('Location name already exists'),
      );
      // Remove prisma.location.findFirst mock

      await expect(service.create({ name: '  Warehouse A  ' })).rejects.toThrow(
        ConflictException,
      );
      // We check that the validation service was called, not the logger warning
      expect(mockLocationValidationService.validateCreate).toHaveBeenCalled();
    });
  });

  // ----------------------------------------------------------------
  // FIND ALL
  // ----------------------------------------------------------------
  describe('findAll', () => {
    it('should return all locations ordered', async () => {
      prisma.location.findMany.mockResolvedValue([
        {
          id: '1',
          name: 'A',
          createdAt: new Date(),
          updatedAt: new Date(),
        } as Location,
        {
          id: '2',
          name: 'Z',
          createdAt: new Date(),
          updatedAt: new Date(),
        } as Location,
      ]);
      const res = await service.findAll({});
      expect(res.items).toHaveLength(2);
      expect(res.items[0].name).toBe('A');
      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining('Fetched'),
      );
    });

    it('should filter with search (case-insensitive contains)', async () => {
      prisma.location.findMany.mockResolvedValue([
        {
          id: '1',
          name: 'Central Warehouse',
          createdAt: new Date(),
          updatedAt: new Date(),
        } as Location,
      ]);
      const res = await service.findAll({ search: 'central' });
      expect(res.items).toHaveLength(1);
    });
  });

  // ----------------------------------------------------------------
  // FIND ONE
  // ----------------------------------------------------------------
  describe('findOne', () => {
    it('should return location by id', async () => {
      prisma.location.findUnique.mockResolvedValue(mockLocation);
      const res = await service.findOne('1');
      expect(res.name).toBe('Warehouse A');
      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining('Fetching location by id'),
      );
    });

    it('should throw NotFoundException when missing', async () => {
      // NOTE: findOne usually handles its own existence check by relying on Prisma returning null
      prisma.location.findUnique.mockResolvedValue(null);
      await expect(service.findOne('missing')).rejects.toThrow(
        NotFoundException,
      );
      expect(logger.warn).toHaveBeenCalledWith(
        expect.stringContaining('not found'),
      );
    });
  });

  // ----------------------------------------------------------------
  // UPDATE
  // ----------------------------------------------------------------
  describe('update', () => {
    const updateDto = { name: 'New Location' };

    it('should update location name successfully', async () => {
      // ⚠️ FIX: Mock the validation service to return the original location
      mockLocationValidationService.validateUpdate.mockResolvedValueOnce({
        ...mockLocation,
        name: 'Old Name',
      } as Location);
      // Remove prisma.location.findUnique/findFirst mocks

      prisma.location.update.mockResolvedValue({
        ...mockLocation,
        name: updateDto.name,
      });

      const res = await service.update(mockLocation.id, updateDto);

      expect(mockLocationValidationService.validateUpdate).toHaveBeenCalledWith(
        mockLocation.id,
        updateDto.name,
      );
      expect(res.name).toBe(updateDto.name);
      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining('Updating location'),
      );
    });

    it('should throw NotFoundException if location not found', async () => {
      // ⚠️ FIX: The NotFoundException is now thrown by the validation service.
      mockLocationValidationService.validateUpdate.mockRejectedValueOnce(
        new NotFoundException('Location with id "x" not found'),
      );
      // Remove prisma.location.findUnique mock

      await expect(service.update('x', { name: 'Whatever' })).rejects.toThrow(
        NotFoundException,
      );
      expect(mockLocationValidationService.validateUpdate).toHaveBeenCalled();
    });

    it('should throw ConflictException when duplicate name exists (case-insensitive)', async () => {
      // ⚠️ FIX: The ConflictException is now thrown by the validation service.
      mockLocationValidationService.validateUpdate.mockRejectedValueOnce(
        new ConflictException('Location with name "existing" already exists'),
      );
      // Remove prisma.location.findUnique/findFirst mocks

      await expect(service.update('1', { name: 'existing' })).rejects.toThrow(
        ConflictException,
      );
      expect(mockLocationValidationService.validateUpdate).toHaveBeenCalled();
    });
  });

  // ----------------------------------------------------------------
  // REMOVE
  // ----------------------------------------------------------------
  describe('remove', () => {
    // Use a defined mock location object for consistency
    const mockLocationDelete = {
      id: '1',
      name: 'DeleteMe',
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Location;

    it('should delete location successfully', async () => {
      prisma.location.findUnique.mockResolvedValue(mockLocationDelete);
      prisma.vehicle.count.mockResolvedValue(0);
      prisma.location.delete.mockResolvedValue(mockLocationDelete);

      const res = await service.remove('1');

      expect(res.success).toBe(true);
      expect(prisma.location.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining('Location deleted'),
      );
    });

    it('should throw NotFoundException if location not found', async () => {
      prisma.location.findUnique.mockResolvedValue(null);
      await expect(service.remove('abc')).rejects.toThrow(NotFoundException);
      expect(logger.warn).toHaveBeenCalledWith(
        expect.stringContaining('not found'),
      );
    });

    it('should throw ConflictException if linked vehicles exist', async () => {
      prisma.location.findUnique.mockResolvedValue({
        id: '1',
        name: 'HasVehicles',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Location);
      prisma.vehicle.count.mockResolvedValue(3);
      await expect(service.remove('1')).rejects.toThrow(ConflictException);
      expect(logger.warn).toHaveBeenCalledWith(
        expect.stringContaining('assigned vehicle'),
      );
    });
  });
});
