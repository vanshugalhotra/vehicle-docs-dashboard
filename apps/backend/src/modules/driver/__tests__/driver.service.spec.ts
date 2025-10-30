import { DriverService } from '../driver.service';
import { createTestModule } from '../../../../test/utils/test-setup';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { MockedPrisma } from '../../../../test/utils/mock-prisma';
import { MockedLogger } from '../../../../test/utils/mock-logger';
import { DriverValidationService } from '../validation/driver-validation.service';

const mockDriverValidationService = {
  // Use jest.fn() so we can use .mockRejectedValueOnce()
  validateCreate: jest.fn().mockResolvedValue(null),
  validateUpdate: jest
    .fn()
    .mockImplementation(
      (id: unknown, name: unknown, phone: unknown, email: unknown) => ({
        id,
        name,
        phone,
        email,
      }),
    ),
};

describe('DriverService', () => {
  let service: DriverService;
  let prisma: MockedPrisma;
  let logger: MockedLogger;

  beforeEach(async () => {
    // Reset mocks before each test to clear any specific mock implementations
    jest.clearAllMocks();
    // Re-setup the default mock implementations defined above
    mockDriverValidationService.validateCreate.mockResolvedValue(null);
    mockDriverValidationService.validateUpdate.mockImplementation(
      (id: unknown, name: unknown, phone: unknown, email: unknown) => ({
        id,
        name,
        phone,
        email,
      }),
    );
    const setup = await createTestModule(DriverService, [
      {
        provide: DriverValidationService,
        useValue: mockDriverValidationService,
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
    it('should create driver successfully', async () => {
      // NOTE: validateCreate is mocked to resolve to null by default
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
      // NOTE: validateCreate is mocked to resolve to null by default
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
      // ⚠️ FIX: Mock the validation service to throw the exception
      mockDriverValidationService.validateCreate.mockRejectedValueOnce(
        new ConflictException('Driver with phone already exists'),
      );

      // Old Prisma mock is now irrelevant for exception throwing
      // prisma.driver.findFirst.mockResolvedValue(...) is no longer needed

      await expect(
        service.create({ name: 'Dup', phone: '9999999999' }),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException if email already exists', async () => {
      // ⚠️ FIX: Mock the validation service to throw the exception
      mockDriverValidationService.validateCreate.mockRejectedValueOnce(
        new ConflictException('Driver with email already exists'),
      );

      // Old Prisma mocks are now irrelevant for exception throwing
      // prisma.driver.findFirst.mockResolvedValueOnce(...) is no longer needed

      await expect(
        service.create({
          name: 'Dup',
          phone: '2222222222',
          email: 'john@example.com',
        }),
      ).rejects.toThrow(ConflictException);
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
    });
  });

  // ────────────────────────────────────────────────
  // UPDATE
  // ────────────────────────────────────────────────
  describe('update', () => {
    it('should update driver successfully', async () => {
      // NOTE: validateUpdate is mocked to pass by default
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
      // ⚠️ FIX: Mock the validation service to throw the exception
      mockDriverValidationService.validateUpdate.mockRejectedValueOnce(
        new NotFoundException('Driver not found'),
      );

      // Old Prisma mock is now irrelevant
      // prisma.driver.findUnique.mockResolvedValueOnce(null);

      await expect(
        service.update('missing', { name: 'New Name' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException if phone already exists', async () => {
      // ⚠️ FIX: Mock the validation service to throw the exception
      mockDriverValidationService.validateUpdate.mockRejectedValueOnce(
        new ConflictException('Update failed, duplicate phone'),
      );

      // Old Prisma mocks are now irrelevant
      // prisma.driver.findUnique.mockResolvedValueOnce(...) is no longer needed

      await expect(service.update('drv1', { phone: '2222' })).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw ConflictException if email already exists', async () => {
      // ⚠️ FIX: Mock the validation service to throw the exception
      mockDriverValidationService.validateUpdate.mockRejectedValueOnce(
        new ConflictException('Update failed, duplicate email'),
      );

      // Old Prisma mocks are now irrelevant
      // prisma.driver.findUnique.mockResolvedValueOnce(...) is no longer needed

      await expect(
        service.update('drv1', { email: 'dup@example.com' }),
      ).rejects.toThrow(ConflictException);
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
