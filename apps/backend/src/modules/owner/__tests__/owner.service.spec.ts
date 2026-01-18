import { OwnerService } from '../owner.service';
import { createTestModule } from '../../../../test/utils/unit-setup/test-setup';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { MockedPrisma } from '../../../../test/utils/unit-setup/mock-prisma';
import { MockedLogger } from '../../../../test/utils/unit-setup/mock-logger';
import { OwnerValidationService } from '../validation/owner-validation.service';
import { AuditService } from 'src/modules/audit/audit.service';

const mockOwnerValidationService = {
  validateCreate: jest.fn().mockResolvedValue(null),
  validateUpdate: jest
    .fn()
    .mockImplementation((id: unknown, name: unknown) => ({ id, name })),
};

const mockAuditService = {
  record: jest.fn().mockResolvedValue(undefined),
};

describe('OwnerService', () => {
  let service: OwnerService;
  let prisma: MockedPrisma;
  let logger: MockedLogger;

  beforeEach(async () => {
    jest.clearAllMocks();
    mockOwnerValidationService.validateCreate.mockResolvedValue(null);
    mockAuditService.record.mockResolvedValue(undefined);
    mockOwnerValidationService.validateUpdate.mockImplementation(
      (id: unknown, name: unknown) => ({ id, name }),
    );

    const setup = await createTestModule(OwnerService, [
      { provide: OwnerValidationService, useValue: mockOwnerValidationService },
      {
        provide: AuditService,
        useValue: mockAuditService,
      },
    ]);
    service = setup.service;
    prisma = setup.mocks.prisma;
    logger = setup.mocks.logger;
  });

  afterEach(() => jest.clearAllMocks());

  describe('create', () => {
    it('should create owner successfully', async () => {
      prisma.owner.create.mockResolvedValue({ id: 'own1', name: 'Ustaad Ji' });

      const result = await service.create({ name: 'Ustaad Ji' });

      expect(result.name).toBe('Ustaad Ji');
      expect(prisma.owner.create).toHaveBeenCalledWith({
        data: { name: 'Ustaad Ji' },
      });
      expect(logger.logInfo).toHaveBeenCalledWith(
        expect.stringContaining('Creating owner'),
        expect.any(Object),
      );
    });

    it('should throw ConflictException if owner already exists', async () => {
      mockOwnerValidationService.validateCreate.mockRejectedValueOnce(
        new ConflictException('Owner already exists'),
      );

      await expect(service.create({ name: 'Ustaad Ji' })).rejects.toThrow(
        ConflictException,
      );
      expect(logger.logError).toHaveBeenCalledWith(
        expect.stringContaining('Failed'),
        expect.any(Object),
      );
    });
  });

  describe('findAll', () => {
    it('should return all owners ordered by name', async () => {
      prisma.owner.findMany.mockResolvedValue([
        { id: '1', name: 'Alpha Motors' },
        { id: '2', name: 'Zeta Logistics' },
      ]);
      prisma.owner.count.mockResolvedValue(2);

      const result = await service.findAll({});

      expect(result.items).toHaveLength(2);
      expect(result.items[0].name).toBe('Alpha Motors');
      expect(logger.logDebug).toHaveBeenCalledWith(
        expect.stringContaining('Fetching'),
        expect.any(Object),
      );
      expect(logger.logInfo).toHaveBeenCalledWith(
        expect.stringContaining('Fetched'),
        expect.any(Object),
      );
    });

    it('should filter owners by search term', async () => {
      prisma.owner.findMany.mockResolvedValue([{ id: '1', name: 'Ustaad Ji' }]);
      prisma.owner.count.mockResolvedValue(1);

      const result = await service.findAll({ search: 'ustaad' });

      expect(result.items).toHaveLength(1);
      expect(logger.logDebug).toHaveBeenCalledWith(
        expect.stringContaining('Fetching'),
        expect.any(Object),
      );
    });
  });

  describe('findOne', () => {
    it('should return owner by id', async () => {
      prisma.owner.findUnique.mockResolvedValue({ id: '1', name: 'Ustaad Ji' });

      const result = await service.findOne('1');

      expect(result.name).toBe('Ustaad Ji');
      expect(logger.logInfo).toHaveBeenCalledWith(
        expect.stringContaining('Fetching'),
        expect.any(Object),
      );
    });

    it('should throw NotFoundException if owner not found', async () => {
      prisma.owner.findUnique.mockResolvedValue(null);

      await expect(service.findOne('xyz')).rejects.toThrow(NotFoundException);
      expect(logger.logWarn).toHaveBeenCalledWith(
        expect.stringContaining('not found'),
        expect.any(Object),
      );
    });
  });

  describe('update', () => {
    it('should update owner name successfully', async () => {
      prisma.owner.update.mockResolvedValue({ id: '1', name: 'New Name' });

      const result = await service.update('1', { name: 'New Name' });

      expect(result.name).toBe('New Name');
      expect(logger.logInfo).toHaveBeenCalledWith(
        expect.stringContaining('Updating'),
        expect.any(Object),
      );
    });

    it('should throw NotFoundException if owner not found', async () => {
      mockOwnerValidationService.validateUpdate.mockRejectedValueOnce(
        new NotFoundException('Owner not found'),
      );

      await expect(service.update('x', { name: 'New Name' })).rejects.toThrow(
        NotFoundException,
      );
      expect(logger.logError).toHaveBeenCalledWith(
        expect.stringContaining('Failed'),
        expect.any(Object),
      );
    });

    it('should throw ConflictException if new name already exists', async () => {
      mockOwnerValidationService.validateUpdate.mockRejectedValueOnce(
        new ConflictException('duplicate owner name'),
      );

      await expect(service.update('1', { name: 'New' })).rejects.toThrow(
        ConflictException,
      );
      expect(logger.logError).toHaveBeenCalledWith(
        expect.stringContaining('Failed'),
        expect.any(Object),
      );
    });
  });

  describe('remove', () => {
    it('should delete owner successfully', async () => {
      prisma.owner.findUnique.mockResolvedValue({ id: '1', name: 'Ustaad Ji' });
      prisma.vehicle.count.mockResolvedValue(0);
      prisma.owner.delete.mockResolvedValue({});

      const result = await service.remove('1');

      expect(result.success).toBe(true);
      expect(prisma.owner.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(logger.logInfo).toHaveBeenCalledWith(
        expect.stringContaining('Deleting'),
        expect.any(Object),
      );
      expect(logger.logInfo).toHaveBeenCalledWith(
        expect.stringContaining('Owner deleted'),
        expect.any(Object),
      );
    });

    it('should throw NotFoundException if owner not found', async () => {
      prisma.owner.findUnique.mockResolvedValue(null);

      await expect(service.remove('abc')).rejects.toThrow(NotFoundException);
      expect(logger.logWarn).toHaveBeenCalledWith(
        expect.stringContaining('Delete failed'),
        expect.any(Object),
      );
    });

    it('should throw ConflictException if owner has linked vehicles', async () => {
      prisma.owner.findUnique.mockResolvedValue({ id: '1', name: 'FleetCo' });
      prisma.vehicle.count.mockResolvedValue(2);

      await expect(service.remove('1')).rejects.toThrow(ConflictException);
      expect(logger.logWarn).toHaveBeenCalledWith(
        expect.stringContaining('Delete failed'),
        expect.any(Object),
      );
    });
  });
});
