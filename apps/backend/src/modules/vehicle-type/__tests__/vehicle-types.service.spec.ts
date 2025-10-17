import { VehicleTypeService } from '../vehicle-types.service';
import { createTestModule } from '../../../../test/utils/test-setup';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { MockedPrisma } from '../../../../test/utils/mock-prisma';
import { MockedLogger } from '../../../../test/utils/mock-logger';

describe('VehicleTypeService', () => {
  let service: VehicleTypeService;
  let prisma: MockedPrisma;
  let logger: MockedLogger;

  beforeEach(async () => {
    const setup = await createTestModule(VehicleTypeService);
    service = setup.service;
    prisma = setup.mocks.prisma;
    logger = setup.mocks.logger;
  });

  afterEach(() => jest.clearAllMocks());

  describe('create', () => {
    it('should create vehicle type', async () => {
      prisma.vehicleCategory.findUnique.mockResolvedValue({
        id: 'cat1',
        name: 'Car',
      });
      prisma.vehicleType.findFirst.mockResolvedValue(null);
      prisma.vehicleType.create.mockResolvedValue({
        id: 'type1',
        name: 'Sedan',
        vehicles: [],
      });

      const result = await service.create({
        name: 'Sedan',
        categoryId: 'cat1',
      });
      expect(result.name).toBe('Sedan');
      expect(logger.info).toHaveBeenCalled();
    });

    it('should throw NotFoundException if category not found', async () => {
      prisma.vehicleCategory.findUnique.mockResolvedValue(null);
      await expect(
        service.create({ name: 'SUV', categoryId: 'catX' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should list all vehicle types', async () => {
      prisma.vehicleType.findMany.mockResolvedValue([
        { id: '1', name: 'Sedan' },
      ]);
      const result = await service.findAll();
      expect(result).toHaveLength(1);
    });
  });

  describe('update', () => {
    it('should update vehicle type', async () => {
      prisma.vehicleType.findUnique.mockResolvedValueOnce({
        id: '1',
        name: 'Sedan',
        categoryId: 'cat1',
      });
      prisma.vehicleType.findFirst.mockResolvedValueOnce(null);
      prisma.vehicleType.update.mockResolvedValue({ id: '1', name: 'SUV' });

      const result = await service.update('1', { name: 'SUV' });
      expect(result.name).toBe('SUV');
    });

    it('should throw ConflictException if duplicate name exists', async () => {
      prisma.vehicleType.findUnique.mockResolvedValueOnce({
        id: '1',
        name: 'Sedan',
        categoryId: 'cat1',
      });
      prisma.vehicleType.findFirst.mockResolvedValueOnce({
        id: '2',
        name: 'SUV',
      });
      await expect(service.update('1', { name: 'SUV' })).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('remove', () => {
    it('should delete vehicle type', async () => {
      prisma.vehicleType.findUnique.mockResolvedValue({ id: '1' });
      prisma.vehicleType.delete.mockResolvedValue({});
      const result = await service.remove('1');
      expect(result.success).toBe(true);
    });
  });
});
