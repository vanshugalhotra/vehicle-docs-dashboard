import { VehicleCategoryService } from '../vehicle-category.service';
import { createTestModule } from '../../../../test/utils/test-setup';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { MockedPrisma } from '../../../../test/utils/mock-prisma';
import { MockedLogger } from '../../../../test/utils/mock-logger';

describe('VehicleCategoryService', () => {
  let service: VehicleCategoryService;
  let prisma: MockedPrisma;
  let logger: MockedLogger;

  beforeEach(async () => {
    const setup = await createTestModule(VehicleCategoryService);
    service = setup.service;
    prisma = setup.mocks.prisma;
    logger = setup.mocks.logger;
  });

  afterEach(() => jest.clearAllMocks());

  describe('create', () => {
    it('should create category', async () => {
      prisma.vehicleCategory.findFirst.mockResolvedValue(null);
      prisma.vehicleCategory.create.mockResolvedValue({ id: '1', name: 'Car' });

      const result = await service.create({ name: 'Car' });

      expect(result.name).toBe('Car');
      expect(prisma.vehicleCategory.create).toHaveBeenCalledWith({
        data: { name: 'Car' },
      });
      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining('Creating'),
      );
    });

    it('should throw ConflictException if exists', async () => {
      prisma.vehicleCategory.findFirst.mockResolvedValue({
        id: '1',
        name: 'Car',
      });
      await expect(service.create({ name: 'Car' })).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('findAll', () => {
    it('should return all categories', async () => {
      prisma.vehicleCategory.findMany.mockResolvedValue([
        { id: '1', name: 'Car' },
      ]);
      const result = await service.findAll({});
      expect(result.items).toHaveLength(1);
    });
  });

  describe('findOne', () => {
    it('should return category if exists', async () => {
      prisma.vehicleCategory.findUnique.mockResolvedValue({
        id: '1',
        name: 'Car',
      });
      const result = await service.findOne('1');
      expect(result.id).toBe('1');
    });

    it('should throw NotFoundException if not found', async () => {
      prisma.vehicleCategory.findUnique.mockResolvedValue(null);
      await expect(service.findOne('X')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update successfully', async () => {
      prisma.vehicleCategory.findUnique
        .mockResolvedValueOnce({ id: '1', name: 'Car' })
        .mockResolvedValueOnce(null);
      prisma.vehicleCategory.update.mockResolvedValue({
        id: '1',
        name: 'Truck',
      });

      const result = await service.update('1', { name: 'Truck' });
      expect(result.name).toBe('Truck');
    });
  });

  describe('remove', () => {
    it('should delete category', async () => {
      prisma.vehicleCategory.findUnique.mockResolvedValue({
        id: '1',
        name: 'Car',
        types: [],
      });

      prisma.vehicleCategory.delete.mockResolvedValue({ id: '1', name: 'Car' });

      const result = await service.remove('1');

      expect(result).toEqual({ success: true });
      expect(prisma.vehicleCategory.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });
  });
});
