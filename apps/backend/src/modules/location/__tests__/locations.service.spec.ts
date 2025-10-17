import { LocationsService } from '../locations.service';
import { createTestModule } from '../../../../test/utils/test-setup';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { MockedPrisma } from '../../../../test/utils/mock-prisma';
import { MockedLogger } from '../../../../test/utils/mock-logger';

describe('LocationsService', () => {
  let service: LocationsService;
  let prisma: MockedPrisma;
  let logger: MockedLogger;

  beforeEach(async () => {
    const setup = await createTestModule(LocationsService);
    service = setup.service;
    prisma = setup.mocks.prisma;
    logger = setup.mocks.logger;
  });

  afterEach(() => jest.clearAllMocks());

  // CREATE
  describe('create', () => {
    it('should create location successfully', async () => {
      prisma.location.findFirst.mockResolvedValue(null);
      prisma.location.create.mockResolvedValue({
        id: 'loc1',
        name: 'Warehouse A',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const res = await service.create({ name: 'Warehouse A' });
      expect(res.name).toBe('Warehouse A');
      expect(prisma.location.create).toHaveBeenCalledWith({
        data: { name: 'Warehouse A' },
      });
      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining('Creating location'),
      );
    });

    it('should trim input name and treat duplicates case-insensitively', async () => {
      // existing lowercased in DB
      prisma.location.findFirst.mockResolvedValue({
        id: 'loc1',
        name: 'warehouse a',
      });
      await expect(service.create({ name: '  Warehouse A  ' })).rejects.toThrow(
        ConflictException,
      );
      expect(logger.warn).toHaveBeenCalledWith(
        expect.stringContaining('already exists'),
      );
    });
  });

  // FIND ALL
  describe('findAll', () => {
    it('should return all locations ordered', async () => {
      prisma.location.findMany.mockResolvedValue([
        { id: '1', name: 'A', createdAt: new Date(), updatedAt: new Date() },
        { id: '2', name: 'Z', createdAt: new Date(), updatedAt: new Date() },
      ]);
      const res = await service.findAll();
      expect(res).toHaveLength(2);
      expect(res[0].name).toBe('A');
      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining('Fetching all locations'),
      );
    });

    it('should filter with search (case-insensitive contains)', async () => {
      prisma.location.findMany.mockResolvedValue([
        {
          id: '1',
          name: 'Central Warehouse',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);
      const res = await service.findAll('central');
      expect(res).toHaveLength(1);
      expect(prisma.location.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { name: { contains: 'central', mode: 'insensitive' } },
        }),
      );
    });
  });

  // FIND ONE
  describe('findOne', () => {
    it('should return location by id', async () => {
      prisma.location.findUnique.mockResolvedValue({
        id: '1',
        name: 'Main',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      const res = await service.findOne('1');
      expect(res.name).toBe('Main');
      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining('Fetching location by id'),
      );
    });

    it('should throw NotFoundException when missing', async () => {
      prisma.location.findUnique.mockResolvedValue(null);
      await expect(service.findOne('missing')).rejects.toThrow(
        NotFoundException,
      );
      expect(logger.warn).toHaveBeenCalledWith(
        expect.stringContaining('not found'),
      );
    });
  });

  // UPDATE
  describe('update', () => {
    it('should update location name successfully', async () => {
      prisma.location.findUnique.mockResolvedValueOnce({
        id: '1',
        name: 'Old',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      prisma.location.findFirst.mockResolvedValueOnce(null); // no duplicate
      prisma.location.update.mockResolvedValue({
        id: '1',
        name: 'New',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const res = await service.update('1', { name: 'New' });
      expect(res.name).toBe('New');
      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining('Updating location'),
      );
    });

    it('should throw NotFoundException if location not found', async () => {
      prisma.location.findUnique.mockResolvedValueOnce(null);
      await expect(service.update('x', { name: 'Whatever' })).rejects.toThrow(
        NotFoundException,
      );
      expect(logger.warn).toHaveBeenCalledWith(
        expect.stringContaining('not found'),
      );
    });

    it('should throw ConflictException when duplicate name exists (case-insensitive)', async () => {
      prisma.location.findUnique.mockResolvedValueOnce({
        id: '1',
        name: 'Old',
      });
      prisma.location.findFirst.mockResolvedValueOnce({
        id: '2',
        name: 'existing',
      });
      await expect(service.update('1', { name: 'existing' })).rejects.toThrow(
        ConflictException,
      );
      expect(logger.warn).toHaveBeenCalledWith(
        expect.stringContaining('duplicate location name'),
      );
    });
  });

  // REMOVE
  describe('remove', () => {
    it('should delete location successfully', async () => {
      prisma.location.findUnique.mockResolvedValue({
        id: '1',
        name: 'DeleteMe',
      });
      prisma.vehicle.count.mockResolvedValue(0);
      prisma.location.delete.mockResolvedValue({});
      const res = await service.remove('1');
      expect(res.success).toBe(true);
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
      });
      prisma.vehicle.count.mockResolvedValue(3);
      await expect(service.remove('1')).rejects.toThrow(ConflictException);
      expect(logger.warn).toHaveBeenCalledWith(
        expect.stringContaining('assigned vehicle'),
      );
    });
  });
});
