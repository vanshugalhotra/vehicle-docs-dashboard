import { DocumentTypesService } from '../document-type.service';
import { createTestModule } from '../../../../test/utils/test-setup';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { MockedPrisma } from '../../../../test/utils/mock-prisma';
import { MockedLogger } from '../../../../test/utils/mock-logger';

describe('DocumentTypesService', () => {
  let service: DocumentTypesService;
  let prisma: MockedPrisma;
  let logger: MockedLogger;

  beforeEach(async () => {
    const setup = await createTestModule(DocumentTypesService);
    service = setup.service;
    prisma = setup.mocks.prisma;
    logger = setup.mocks.logger;
  });

  afterEach(() => jest.clearAllMocks());

  // ────────────────────────────────────────────────
  // CREATE
  // ────────────────────────────────────────────────
  describe('create', () => {
    it('should create document type successfully', async () => {
      prisma.documentType.findFirst.mockResolvedValue(null);
      prisma.documentType.create.mockResolvedValue({
        id: 'doc1',
        name: 'Insurance Certificate',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await service.create({ name: 'Insurance Certificate' });
      expect(result.name).toBe('Insurance Certificate');
      expect(prisma.documentType.create).toHaveBeenCalledWith({
        data: { name: 'Insurance Certificate' },
      });
      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining('Creating document type'),
      );
    });

    it('should throw ConflictException if document type already exists (case-insensitive)', async () => {
      prisma.documentType.findFirst.mockResolvedValue({
        id: 'doc1',
        name: 'insurance certificate',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      await expect(
        service.create({ name: 'Insurance Certificate' }),
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
    it('should return all document types', async () => {
      prisma.documentType.findMany.mockResolvedValue([
        {
          id: '1',
          name: 'Insurance Certificate',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          name: 'Pollution Certificate',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);
      const result = await service.findAll({});
      expect(result.items).toHaveLength(2);
      expect(result.items[0].name).toBe('Insurance Certificate');
      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining('Fetched'),
      );
    });

    it('should filter document types by search term', async () => {
      prisma.documentType.findMany.mockResolvedValue([
        {
          id: '1',
          name: 'Insurance Certificate',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);
      const result = await service.findAll({ search: 'insurance' });
      expect(result.items).toHaveLength(1);
    });
  });

  // ────────────────────────────────────────────────
  // FIND ONE
  // ────────────────────────────────────────────────
  describe('findOne', () => {
    it('should return document type by id', async () => {
      prisma.documentType.findUnique.mockResolvedValue({
        id: '1',
        name: 'Insurance Certificate',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      const result = await service.findOne('1');
      expect(result.name).toBe('Insurance Certificate');
      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining('Fetching document type by id'),
      );
    });

    it('should throw NotFoundException if document type not found', async () => {
      prisma.documentType.findUnique.mockResolvedValue(null);
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
    it('should update document type name successfully', async () => {
      prisma.documentType.findUnique.mockResolvedValueOnce({
        id: '1',
        name: 'Old Certificate',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      prisma.documentType.findFirst.mockResolvedValueOnce(null);
      prisma.documentType.update.mockResolvedValue({
        id: '1',
        name: 'Updated Certificate',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await service.update('1', { name: 'Updated Certificate' });
      expect(result.name).toBe('Updated Certificate');
      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining('Updating document type'),
      );
    });

    it('should throw NotFoundException if document type not found', async () => {
      prisma.documentType.findUnique.mockResolvedValueOnce(null);
      await expect(service.update('x', { name: 'New Name' })).rejects.toThrow(
        NotFoundException,
      );
      expect(logger.warn).toHaveBeenCalledWith(
        expect.stringContaining('not found'),
      );
    });

    it('should throw ConflictException if new name already exists', async () => {
      prisma.documentType.findUnique.mockResolvedValueOnce({
        id: '1',
        name: 'Old Certificate',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      prisma.documentType.findFirst.mockResolvedValueOnce({
        id: '2',
        name: 'New Certificate',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await expect(
        service.update('1', { name: 'New Certificate' }),
      ).rejects.toThrow(ConflictException);
      expect(logger.warn).toHaveBeenCalledWith(
        expect.stringContaining('duplicate document type name'),
      );
    });
  });

  // ────────────────────────────────────────────────
  // REMOVE
  // ────────────────────────────────────────────────
  describe('remove', () => {
    it('should throw NotFoundException if document type not found', async () => {
      prisma.documentType.findUnique.mockResolvedValue(null);
      await expect(service.remove('abc')).rejects.toThrow(NotFoundException);
      expect(logger.warn).toHaveBeenCalledWith(
        expect.stringContaining('not found'),
      );
    });
  });
});
