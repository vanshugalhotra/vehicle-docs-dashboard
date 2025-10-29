import { OwnersService } from '../owners.service';
import { createTestModule } from '../../../../test/utils/test-setup';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { MockedPrisma } from '../../../../test/utils/mock-prisma';
import { MockedLogger } from '../../../../test/utils/mock-logger';

describe('OwnersService', () => {
  let service: OwnersService;
  let prisma: MockedPrisma;
  let logger: MockedLogger;

  beforeEach(async () => {
    const setup = await createTestModule(OwnersService);
    service = setup.service;
    prisma = setup.mocks.prisma;
    logger = setup.mocks.logger;
  });

  afterEach(() => jest.clearAllMocks());

  // ────────────────────────────────────────────────
  // CREATE
  // ────────────────────────────────────────────────
  describe('create', () => {
    it('should create owner successfully', async () => {
      prisma.owner.findFirst.mockResolvedValue(null);
      prisma.owner.create.mockResolvedValue({ id: 'own1', name: 'Ustaad Ji' });

      const result = await service.create({ name: 'Ustaad Ji' });
      expect(result.name).toBe('Ustaad Ji');
      expect(prisma.owner.create).toHaveBeenCalledWith({
        data: { name: 'Ustaad Ji' },
      });
      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining('Creating owner'),
      );
    });

    it('should throw ConflictException if owner already exists (case-insensitive)', async () => {
      prisma.owner.findFirst.mockResolvedValue({
        id: 'own1',
        name: 'ustaad ji',
      });
      await expect(service.create({ name: 'Ustaad Ji' })).rejects.toThrow(
        ConflictException,
      );
      expect(logger.warn).toHaveBeenCalledWith(
        expect.stringContaining('already exists'),
      );
    });
  });

  // ────────────────────────────────────────────────
  // FIND ALL
  // ────────────────────────────────────────────────
  describe('findAll', () => {
    it('should return all owners ordered by name', async () => {
      prisma.owner.findMany.mockResolvedValue([
        { id: '1', name: 'Alpha Motors' },
        { id: '2', name: 'Zeta Logistics' },
      ]);
      const result = await service.findAll({});
      expect(result.items).toHaveLength(2);
      expect(result.items[0].name).toBe('Alpha Motors');
      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining('Fetched'),
      );
    });

    it('should filter owners by search term', async () => {
      prisma.owner.findMany.mockResolvedValue([{ id: '1', name: 'Ustaad Ji' }]);
      const result = await service.findAll({ search: 'ustaad' });
      expect(result.items).toHaveLength(1);
    });
  });

  // ────────────────────────────────────────────────
  // FIND ONE
  // ────────────────────────────────────────────────
  describe('findOne', () => {
    it('should return owner by id', async () => {
      prisma.owner.findUnique.mockResolvedValue({ id: '1', name: 'Ustaad Ji' });
      const result = await service.findOne('1');
      expect(result.name).toBe('Ustaad Ji');
      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining('Fetching owner by id'),
      );
    });

    it('should throw NotFoundException if owner not found', async () => {
      prisma.owner.findUnique.mockResolvedValue(null);
      await expect(service.findOne('xyz')).rejects.toThrow(NotFoundException);
      expect(logger.warn).toHaveBeenCalledWith(
        expect.stringContaining('not found'),
      );
    });
  });

  // ────────────────────────────────────────────────
  // UPDATE
  // ────────────────────────────────────────────────
  describe('update', () => {
    it('should update owner name successfully', async () => {
      prisma.owner.findUnique.mockResolvedValueOnce({
        id: '1',
        name: 'Old Name',
      });
      prisma.owner.findFirst.mockResolvedValueOnce(null);
      prisma.owner.update.mockResolvedValue({ id: '1', name: 'New Name' });

      const result = await service.update('1', { name: 'New Name' });
      expect(result.name).toBe('New Name');
      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining('Updating owner'),
      );
    });

    it('should throw NotFoundException if owner not found', async () => {
      prisma.owner.findUnique.mockResolvedValueOnce(null);
      await expect(service.update('x', { name: 'New Name' })).rejects.toThrow(
        NotFoundException,
      );
      expect(logger.warn).toHaveBeenCalledWith(
        expect.stringContaining('not found'),
      );
    });

    it('should throw ConflictException if new name already exists', async () => {
      prisma.owner.findUnique.mockResolvedValueOnce({ id: '1', name: 'Old' });
      prisma.owner.findFirst.mockResolvedValueOnce({ id: '2', name: 'New' });

      await expect(service.update('1', { name: 'New' })).rejects.toThrow(
        ConflictException,
      );
      expect(logger.warn).toHaveBeenCalledWith(
        expect.stringContaining('duplicate owner name'),
      );
    });
  });

  // ────────────────────────────────────────────────
  // REMOVE
  // ────────────────────────────────────────────────
  describe('remove', () => {
    it('should delete owner successfully', async () => {
      prisma.owner.findUnique.mockResolvedValue({ id: '1', name: 'Ustaad Ji' });
      prisma.vehicle.count.mockResolvedValue(0);
      prisma.owner.delete.mockResolvedValue({});
      const result = await service.remove('1');
      expect(result.success).toBe(true);
      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining('Owner deleted'),
      );
    });

    it('should throw NotFoundException if owner not found', async () => {
      prisma.owner.findUnique.mockResolvedValue(null);
      await expect(service.remove('abc')).rejects.toThrow(NotFoundException);
      expect(logger.warn).toHaveBeenCalledWith(
        expect.stringContaining('not found'),
      );
    });

    it('should throw ConflictException if owner has linked vehicles', async () => {
      prisma.owner.findUnique.mockResolvedValue({ id: '1', name: 'FleetCo' });
      prisma.vehicle.count.mockResolvedValue(2);
      await expect(service.remove('1')).rejects.toThrow(ConflictException);
      expect(logger.warn).toHaveBeenCalledWith(
        expect.stringContaining('assigned vehicle'),
      );
    });
  });
});
