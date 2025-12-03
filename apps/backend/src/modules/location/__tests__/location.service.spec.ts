import { LocationService } from '../location.service';
import { createTestModule } from '../../../../test/utils/test-setup';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { MockedPrisma } from '../../../../test/utils/mock-prisma';
import { MockedLogger } from '../../../../test/utils/mock-logger';
import { LocationValidationService } from '../validation/location-validation.service';
import { Location } from '@prisma/client';

const mockLocationValidationService = {
  validateCreate: jest.fn().mockResolvedValue(null),
  validateUpdate: jest.fn(),
};

describe('LocationService', () => {
  let service: LocationService;
  let prisma: MockedPrisma;
  let logger: MockedLogger;

  const mockLocation: Location = {
    id: 'loc1',
    name: 'Warehouse A',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    mockLocationValidationService.validateCreate.mockResolvedValue(null);
    mockLocationValidationService.validateUpdate.mockImplementation(
      (id: string, name: string) =>
        ({
          ...mockLocation,
          id,
          name: name || mockLocation.name,
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

  describe('create', () => {
    it('should create location successfully', async () => {
      prisma.location.create.mockResolvedValue(mockLocation);

      const res = await service.create({ name: 'Warehouse A' });

      expect(mockLocationValidationService.validateCreate).toHaveBeenCalledWith(
        'Warehouse A',
      );
      expect(res.name).toBe('Warehouse A');
      expect(prisma.location.create).toHaveBeenCalledWith({
        data: { name: 'Warehouse A' },
      });
      expect(logger.logInfo).toHaveBeenCalledWith(
        expect.stringContaining('Creating location'),
        expect.any(Object),
      );
    });

    it('should handle validation error', async () => {
      mockLocationValidationService.validateCreate.mockRejectedValueOnce(
        new ConflictException('Location name already exists'),
      );

      await expect(service.create({ name: 'Warehouse A' })).rejects.toThrow(
        ConflictException,
      );
      expect(mockLocationValidationService.validateCreate).toHaveBeenCalled();
      expect(logger.logError).toHaveBeenCalledWith(
        expect.stringContaining('Failed to create'),
        expect.any(Object),
      );
    });
  });

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
      prisma.location.count.mockResolvedValue(2);

      const res = await service.findAll({});

      expect(res.items).toHaveLength(2);
      expect(res.items[0].name).toBe('A');
      expect(logger.logDebug).toHaveBeenCalledWith(
        expect.stringContaining('Fetching'),
        expect.any(Object),
      );
      expect(logger.logInfo).toHaveBeenCalledWith(
        expect.stringContaining('Fetched'),
        expect.any(Object),
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
      prisma.location.count.mockResolvedValue(1);

      const res = await service.findAll({ search: 'central' });

      expect(res.items).toHaveLength(1);
      expect(logger.logDebug).toHaveBeenCalledWith(
        expect.stringContaining('Fetching'),
        expect.any(Object),
      );
    });
  });

  describe('findOne', () => {
    it('should return location by id', async () => {
      prisma.location.findUnique.mockResolvedValue(mockLocation);

      const res = await service.findOne('1');

      expect(res.name).toBe('Warehouse A');
      expect(logger.logInfo).toHaveBeenCalledWith(
        expect.stringContaining('Fetching'),
        expect.any(Object),
      );
    });

    it('should throw NotFoundException when missing', async () => {
      prisma.location.findUnique.mockResolvedValue(null);

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
    const updateDto = { name: 'New Location' };

    it('should update location name successfully', async () => {
      mockLocationValidationService.validateUpdate.mockResolvedValueOnce({
        ...mockLocation,
        name: 'Old Name',
      } as Location);

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
      expect(logger.logInfo).toHaveBeenCalledWith(
        expect.stringContaining('Updating'),
        expect.any(Object),
      );
      expect(logger.logInfo).toHaveBeenCalledWith(
        expect.stringContaining('Location updated'),
        expect.any(Object),
      );
    });

    it('should throw NotFoundException if location not found', async () => {
      mockLocationValidationService.validateUpdate.mockRejectedValueOnce(
        new NotFoundException('Location with id "x" not found'),
      );

      await expect(service.update('x', { name: 'Whatever' })).rejects.toThrow(
        NotFoundException,
      );
      expect(mockLocationValidationService.validateUpdate).toHaveBeenCalled();
      expect(logger.logError).toHaveBeenCalledWith(
        expect.stringContaining('Failed'),
        expect.any(Object),
      );
    });

    it('should throw ConflictException when duplicate name exists (case-insensitive)', async () => {
      mockLocationValidationService.validateUpdate.mockRejectedValueOnce(
        new ConflictException('Location with name "existing" already exists'),
      );

      await expect(service.update('1', { name: 'existing' })).rejects.toThrow(
        ConflictException,
      );
      expect(mockLocationValidationService.validateUpdate).toHaveBeenCalled();
      expect(logger.logError).toHaveBeenCalledWith(
        expect.stringContaining('Failed'),
        expect.any(Object),
      );
    });
  });

  describe('remove', () => {
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
      expect(logger.logInfo).toHaveBeenCalledWith(
        expect.stringContaining('Deleting'),
        expect.any(Object),
      );
      expect(logger.logInfo).toHaveBeenCalledWith(
        expect.stringContaining('Location deleted'),
        expect.any(Object),
      );
    });

    it('should throw NotFoundException if location not found', async () => {
      prisma.location.findUnique.mockResolvedValue(null);

      await expect(service.remove('abc')).rejects.toThrow(NotFoundException);
      expect(logger.logWarn).toHaveBeenCalledWith(
        expect.stringContaining('Delete failed'),
        expect.any(Object),
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
      expect(logger.logWarn).toHaveBeenCalledWith(
        expect.stringContaining('Delete failed'),
        expect.any(Object),
      );
    });
  });
});
