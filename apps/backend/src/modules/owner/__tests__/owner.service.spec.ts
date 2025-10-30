import { OwnerService } from '../owner.service';
import { createTestModule } from '../../../../test/utils/test-setup';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { MockedPrisma } from '../../../../test/utils/mock-prisma';
import { MockedLogger } from '../../../../test/utils/mock-logger';
import { OwnerValidationService } from '../validation/owner-validation.service';

const mockOwnerValidationService = {
  // Mock methods to control behavior (e.g., allow successful validation by default)
  // We use jest.fn() so we can reset or override it per test
  validateCreate: jest.fn().mockResolvedValue(null),
  validateUpdate: jest
    .fn()
    .mockImplementation((id: unknown, name: unknown) => ({ id, name })),
};

describe('OwnerService', () => {
  let service: OwnerService;
  let prisma: MockedPrisma;
  let logger: MockedLogger;

  beforeEach(async () => {
    // Reset mocks before each test to clear any specific mock implementations
    jest.clearAllMocks();
    // Re-setup the default mock implementations defined above
    mockOwnerValidationService.validateCreate.mockResolvedValue(null);
    mockOwnerValidationService.validateUpdate.mockImplementation(
      (id: unknown, name: unknown) => ({ id, name }),
    );

    const setup = await createTestModule(OwnerService, [
      { provide: OwnerValidationService, useValue: mockOwnerValidationService },
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
    it('should create owner successfully', async () => {
      // NOTE: validateCreate is mocked to resolve to null by default in beforeEach
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
      mockOwnerValidationService.validateCreate.mockRejectedValueOnce(
        new ConflictException('Owner already exists'),
      );

      await expect(service.create({ name: 'Ustaad Ji' })).rejects.toThrow(
        ConflictException,
      );
    });
  });

  // ────────────────────────────────────────────────
  // FIND ALL
  // ────────────────────────────────────────────────
  // ... (findAll and findOne blocks remain unchanged as they don't use the new validation service)

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
    });
  });

  // ────────────────────────────────────────────────
  // UPDATE
  // ────────────────────────────────────────────────
  describe('update', () => {
    it('should update owner name successfully', async () => {
      // NOTE: validateUpdate is mocked to return the owner data by default in beforeEach

      // Since validateUpdate is mocked to pass, we only need to mock the Prisma update call
      prisma.owner.update.mockResolvedValue({ id: '1', name: 'New Name' });

      const result = await service.update('1', { name: 'New Name' });
      expect(result.name).toBe('New Name');
      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining('Updating owner'),
      );
    });

    it('should throw NotFoundException if owner not found', async () => {
      // ⚠️ FIX: The NotFoundException is now thrown by the validation service.
      // The original Prisma mock is removed/ignored.
      mockOwnerValidationService.validateUpdate.mockRejectedValueOnce(
        new NotFoundException('Owner not found'),
      );

      await expect(service.update('x', { name: 'New Name' })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ConflictException if new name already exists', async () => {
      // ⚠️ FIX: The ConflictException is now thrown by the validation service.
      // The original Prisma mocks are removed/ignored.
      mockOwnerValidationService.validateUpdate.mockRejectedValueOnce(
        new ConflictException('duplicate owner name'),
      );

      await expect(service.update('1', { name: 'New' })).rejects.toThrow(
        ConflictException,
      );
    });
  });

  // ────────────────────────────────────────────────
  // REMOVE
  // ────────────────────────────────────────────────
  // ... (remove block remains unchanged as it doesn't use the new validation service)

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
