import { DriverService } from '../driver.service';
import { createTestModule } from '../../../../test/utils/unit-setup/test-setup';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { MockedPrisma } from '../../../../test/utils/unit-setup/mock-prisma';
import { MockedLogger } from '../../../../test/utils/unit-setup/mock-logger';
import { DriverValidationService } from '../validation/driver-validation.service';

const mockDriverValidationService = {
  validateCreate: jest.fn().mockResolvedValue(null),
  validateUpdate: jest
    .fn()
    .mockImplementation((id: unknown, phone: unknown, email: unknown) => ({
      id,
      name: 'Driver Name',
      phone,
      email,
    })),
};

describe('DriverService', () => {
  let service: DriverService;
  let prisma: MockedPrisma;
  let logger: MockedLogger;

  beforeEach(async () => {
    jest.clearAllMocks();
    mockDriverValidationService.validateCreate.mockResolvedValue(null);
    mockDriverValidationService.validateUpdate.mockImplementation(
      (id: unknown, phone: unknown, email: unknown) => ({
        id,
        name: 'Driver Name',
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

  describe('create', () => {
    it('should create driver successfully', async () => {
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
      expect(logger.logInfo).toHaveBeenCalledWith(
        expect.stringContaining('Creating'),
        expect.any(Object),
      );
    });

    it('should allow creation without email', async () => {
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
      expect(logger.logInfo).toHaveBeenCalledWith(
        expect.stringContaining('Creating'),
        expect.any(Object),
      );
    });

    it('should throw ConflictException if phone already exists', async () => {
      mockDriverValidationService.validateCreate.mockRejectedValueOnce(
        new ConflictException('Driver with phone already exists'),
      );

      await expect(
        service.create({ name: 'Dup', phone: '9999999999' }),
      ).rejects.toThrow(ConflictException);
      expect(logger.logError).toHaveBeenCalledWith(
        expect.stringContaining('Error'),
        expect.any(Object),
      );
    });

    it('should throw ConflictException if email already exists', async () => {
      mockDriverValidationService.validateCreate.mockRejectedValueOnce(
        new ConflictException('Driver with email already exists'),
      );

      await expect(
        service.create({
          name: 'Dup',
          phone: '2222222222',
          email: 'john@example.com',
        }),
      ).rejects.toThrow(ConflictException);
      expect(logger.logError).toHaveBeenCalledWith(
        expect.stringContaining('Error'),
        expect.any(Object),
      );
    });
  });

  describe('findAll', () => {
    it('should return all drivers ordered by name', async () => {
      prisma.driver.findMany.mockResolvedValue([
        { id: '1', name: 'Alpha', phone: '1111', email: null },
        { id: '2', name: 'Beta', phone: '2222', email: 'b@x.com' },
      ]);
      prisma.driver.count.mockResolvedValue(2);

      const result = await service.findAll({});
      expect(result.items).toHaveLength(2);
      expect(result.items[0].name).toBe('Alpha');
      expect(logger.logDebug).toHaveBeenCalledWith(
        expect.stringContaining('Fetching'),
        expect.any(Object),
      );
      expect(logger.logInfo).toHaveBeenCalledWith(
        expect.stringContaining('Fetched'),
        expect.any(Object),
      );
    });

    it('should filter drivers by search term', async () => {
      prisma.driver.findMany.mockResolvedValue([
        { id: '1', name: 'John Doe', phone: '9999', email: 'john@example.com' },
      ]);
      prisma.driver.count.mockResolvedValue(1);

      const result = await service.findAll({ search: 'john' });
      expect(result.items).toHaveLength(1);
      expect(logger.logDebug).toHaveBeenCalledWith(
        expect.stringContaining('Fetching'),
        expect.any(Object),
      );
    });
  });

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
      expect(logger.logInfo).toHaveBeenCalledWith(
        expect.stringContaining('Fetching'),
        expect.any(Object),
      );
    });

    it('should throw NotFoundException if driver not found', async () => {
      prisma.driver.findUnique.mockResolvedValue(null);

      await expect(service.findOne('notfound')).rejects.toThrow(
        NotFoundException,
      );
      expect(logger.logWarn).toHaveBeenCalledWith(
        expect.stringContaining('not found'),
        expect.any(Object),
      );
    });
  });

  describe('update', () => {
    it('should update driver successfully', async () => {
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
      expect(logger.logInfo).toHaveBeenCalledWith(
        expect.stringContaining('Updating'),
        expect.any(Object),
      );
    });

    it('should throw NotFoundException if driver not found', async () => {
      mockDriverValidationService.validateUpdate.mockRejectedValueOnce(
        new NotFoundException('Driver not found'),
      );

      await expect(
        service.update('missing', { name: 'New Name' }),
      ).rejects.toThrow(NotFoundException);
      expect(logger.logError).toHaveBeenCalledWith(
        expect.stringContaining('Error'),
        expect.any(Object),
      );
    });

    it('should throw ConflictException if phone already exists', async () => {
      mockDriverValidationService.validateUpdate.mockRejectedValueOnce(
        new ConflictException('Update failed, duplicate phone'),
      );

      await expect(service.update('drv1', { phone: '2222' })).rejects.toThrow(
        ConflictException,
      );
      expect(logger.logError).toHaveBeenCalledWith(
        expect.stringContaining('Error'),
        expect.any(Object),
      );
    });

    it('should throw ConflictException if email already exists', async () => {
      mockDriverValidationService.validateUpdate.mockRejectedValueOnce(
        new ConflictException('Update failed, duplicate email'),
      );

      await expect(
        service.update('drv1', { email: 'dup@example.com' }),
      ).rejects.toThrow(ConflictException);
      expect(logger.logError).toHaveBeenCalledWith(
        expect.stringContaining('Error'),
        expect.any(Object),
      );
    });
  });

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
      expect(logger.logInfo).toHaveBeenCalledWith(
        expect.stringContaining('Deleting'),
        expect.any(Object),
      );
    });

    it('should throw NotFoundException if driver not found', async () => {
      prisma.driver.findUnique.mockResolvedValue(null);

      await expect(service.remove('missing')).rejects.toThrow(
        NotFoundException,
      );
      expect(logger.logWarn).toHaveBeenCalledWith(
        expect.stringContaining('Delete failed'),
        expect.any(Object),
      );
    });

    it('should throw ConflictException if driver linked to vehicles', async () => {
      prisma.driver.findUnique.mockResolvedValue({
        id: 'drv1',
        name: 'Linked',
      });
      prisma.vehicle.count.mockResolvedValue(3);

      await expect(service.remove('drv1')).rejects.toThrow(ConflictException);
      expect(logger.logWarn).toHaveBeenCalledWith(
        expect.stringContaining('Delete failed'),
        expect.any(Object),
      );
    });
  });
});
