import { DriverService } from '../driver.service';
import { createTestModule } from '../../../../test/utils/test-setup';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { MockedPrisma } from '../../../../test/utils/mock-prisma';
import { MockedLogger } from '../../../../test/utils/mock-logger';

describe('DriverService', () => {
  let service: DriverService;
  let prisma: MockedPrisma;
  let logger: MockedLogger;

  beforeEach(async () => {
    const setup = await createTestModule(DriverService);
    service = setup.service;
    prisma = setup.mocks.prisma;
    logger = setup.mocks.logger;
  });

  afterEach(() => jest.clearAllMocks());

  // ────────────────────────────────────────────────
  // CREATE
  // ────────────────────────────────────────────────
  describe('create', () => {
    it('should create driver successfully', async () => {
      prisma.driver.findFirst.mockResolvedValue(null);
      prisma.driver.create.mockResolvedValue({
        id: 'drv1',
        name: 'John Doe',
        phone: '9999999999',
        email: 'john@example.com',
      });

      const result = await service.create({
        name: 'John Doe',
        phone: '9999999999',
        email: 'john@example.com',
      });

      expect(result.name).toBe('John Doe');
      expect(prisma.driver.create).toHaveBeenCalledWith({
        data: {
          name: 'John Doe',
          phone: '9999999999',
          email: 'john@example.com',
        },
      });
      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining('Creating driver'),
      );
    });

    it('should allow creation without email', async () => {
      prisma.driver.findFirst.mockResolvedValue(null);
      prisma.driver.create.mockResolvedValue({
        id: 'drv2',
        name: 'No Email',
        phone: '8888888888',
        email: null,
      });

      const result = await service.create({
        name: 'No Email',
        phone: '8888888888',
      });
      expect(result.email).toBeNull();
      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining('Creating driver'),
      );
    });

    it('should throw ConflictException if phone already exists', async () => {
      prisma.driver.findFirst.mockResolvedValue({
        id: 'drv1',
        name: 'Duplicate',
        phone: '9999999999',
        email: null,
      });

      await expect(
        service.create({ name: 'Dup', phone: '9999999999' }),
      ).rejects.toThrow(ConflictException);

      expect(logger.warn).toHaveBeenCalledWith(
        expect.stringContaining('already exists'),
      );
    });

    it('should throw ConflictException if email already exists', async () => {
      prisma.driver.findFirst
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({
          id: 'drv1',
          name: 'Duplicate',
          phone: '1111111111',
          email: 'john@example.com',
        });

      await expect(
        service.create({
          name: 'Dup',
          phone: '2222222222',
          email: 'john@example.com',
        }),
      ).rejects.toThrow(ConflictException);

      expect(logger.warn).toHaveBeenCalledWith(
        expect.stringContaining('already exists'),
      );
    });
  });

  // ────────────────────────────────────────────────
  // FIND ALL
  // ────────────────────────────────────────────────
  describe('findAll', () => {
    it('should return all drivers ordered by name', async () => {
      prisma.driver.findMany.mockResolvedValue([
        { id: '1', name: 'Alpha', phone: '1111', email: null },
        { id: '2', name: 'Beta', phone: '2222', email: 'b@x.com' },
      ]);

      const result = await service.findAll({});
      expect(result.items).toHaveLength(2);
      expect(result.items[0].name).toBe('Alpha');
      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining('Fetched'),
      );
    });

    it('should filter drivers by search term', async () => {
      prisma.driver.findMany.mockResolvedValue([
        { id: '1', name: 'John Doe', phone: '9999', email: 'john@example.com' },
      ]);

      const result = await service.findAll({ search: 'john' });
      expect(result.items).toHaveLength(1);
    });
  });

  // ────────────────────────────────────────────────
  // FIND ONE
  // ────────────────────────────────────────────────
  describe('findOne', () => {
    it('should return driver by id', async () => {
      prisma.driver.findUnique.mockResolvedValue({
        id: 'drv1',
        name: 'John Doe',
        phone: '9999',
        email: 'john@example.com',
      });

      const result = await service.findOne('drv1');
      expect(result.name).toBe('John Doe');
      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining('Fetching driver by id'),
      );
    });

    it('should throw NotFoundException if driver not found', async () => {
      prisma.driver.findUnique.mockResolvedValue(null);

      await expect(service.findOne('notfound')).rejects.toThrow(
        NotFoundException,
      );
      expect(logger.warn).toHaveBeenCalledWith(
        expect.stringContaining('not found'),
      );
    });
  });

  // ────────────────────────────────────────────────
  // UPDATE
  // ────────────────────────────────────────────────
  describe('update', () => {
    it('should update driver successfully', async () => {
      prisma.driver.findUnique.mockResolvedValueOnce({
        id: 'drv1',
        name: 'Old Name',
        phone: '1111',
        email: 'old@example.com',
      });
      prisma.driver.findFirst.mockResolvedValueOnce(null);
      prisma.driver.update.mockResolvedValue({
        id: 'drv1',
        name: 'New Name',
        phone: '1111',
        email: 'new@example.com',
      });

      const result = await service.update('drv1', {
        name: 'New Name',
        email: 'new@example.com',
      });
      expect(result.name).toBe('New Name');
      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining('Updating driver'),
      );
    });

    it('should throw NotFoundException if driver not found', async () => {
      prisma.driver.findUnique.mockResolvedValueOnce(null);
      await expect(
        service.update('missing', { name: 'New Name' }),
      ).rejects.toThrow(NotFoundException);

      expect(logger.warn).toHaveBeenCalledWith(
        expect.stringContaining('not found'),
      );
    });

    it('should throw ConflictException if phone already exists', async () => {
      prisma.driver.findUnique.mockResolvedValueOnce({
        id: 'drv1',
        name: 'Old',
        phone: '1111',
        email: 'old@example.com',
      });
      prisma.driver.findFirst.mockResolvedValueOnce({
        id: 'drv2',
        name: 'Other',
        phone: '2222',
        email: 'other@example.com',
      });

      await expect(service.update('drv1', { phone: '2222' })).rejects.toThrow(
        ConflictException,
      );

      expect(logger.warn).toHaveBeenCalledWith(
        expect.stringContaining('Update failed, duplicate phone'),
      );
    });

    it('should throw ConflictException if email already exists', async () => {
      prisma.driver.findUnique.mockResolvedValueOnce({
        id: 'drv1',
        name: 'Old',
        phone: '1111',
        email: 'old@example.com',
      });
      prisma.driver.findFirst.mockResolvedValueOnce({
        id: 'drv2',
        name: 'Other',
        phone: '2222',
        email: 'dup@example.com',
      });

      await expect(
        service.update('drv1', { email: 'dup@example.com' }),
      ).rejects.toThrow(ConflictException);
      expect(logger.warn).toHaveBeenCalledWith(
        expect.stringContaining('Update failed, duplicate email'),
      );
    });
  });

  // ────────────────────────────────────────────────
  // REMOVE
  // ────────────────────────────────────────────────
  describe('remove', () => {
    it('should delete driver successfully', async () => {
      prisma.driver.findUnique.mockResolvedValue({
        id: 'drv1',
        name: 'John Doe',
      });
      prisma.vehicle.count.mockResolvedValue(0);
      prisma.driver.delete.mockResolvedValue({});

      const result = await service.remove('drv1');
      expect(result.success).toBe(true);
      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining('Driver deleted'),
      );
    });

    it('should throw NotFoundException if driver not found', async () => {
      prisma.driver.findUnique.mockResolvedValue(null);
      await expect(service.remove('missing')).rejects.toThrow(
        NotFoundException,
      );
      expect(logger.warn).toHaveBeenCalledWith(
        expect.stringContaining('not found'),
      );
    });

    it('should throw ConflictException if driver linked to vehicles', async () => {
      prisma.driver.findUnique.mockResolvedValue({
        id: 'drv1',
        name: 'Linked',
      });
      prisma.vehicle.count.mockResolvedValue(3);

      await expect(service.remove('drv1')).rejects.toThrow(ConflictException);
      expect(logger.warn).toHaveBeenCalledWith(
        expect.stringContaining('Delete failed'),
      );
    });
  });
});
