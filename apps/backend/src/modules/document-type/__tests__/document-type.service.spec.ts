import { DocumentTypesService } from '../document-type.service';
import { createTestModule } from '../../../../test/utils/test-setup';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { MockedPrisma } from '../../../../test/utils/mock-prisma';
import { MockedLogger } from '../../../../test/utils/mock-logger';
import { DocumentTypeValidationService } from '../validation/document-type-validation.service';
import { DocumentType } from '@prisma/client';

const mockDocumentType: DocumentType = {
  id: 'doc1',
  name: 'Insurance Certificate',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockDocumentTypeValidationService = {
  // 1. validateCreate: returns void/null, but we mock resolved value
  validateCreate: jest.fn().mockResolvedValue(null),

  // 2. validateUpdate: returns DocumentType. Mock the implementation to pass by default.
  validateUpdate: jest.fn().mockImplementation(
    (id: string, name?: string) =>
      ({
        ...mockDocumentType,
        id,
        name: name ?? mockDocumentType.name,
      }) as DocumentType,
  ),
};

describe('DocumentTypesService', () => {
  let service: DocumentTypesService;
  let prisma: MockedPrisma;
  let logger: MockedLogger;

  beforeEach(async () => {
    // Reset mocks
    jest.clearAllMocks();
    mockDocumentTypeValidationService.validateCreate.mockResolvedValue(null);
    mockDocumentTypeValidationService.validateUpdate.mockImplementation(
      (id: string, name?: string) =>
        ({
          ...mockDocumentType,
          id,
          name: name ?? mockDocumentType.name,
        }) as DocumentType,
    );

    // Setup module with the validation service mock
    const setup = await createTestModule(DocumentTypesService, [
      {
        provide: DocumentTypeValidationService,
        useValue: mockDocumentTypeValidationService,
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
    it('should create document type successfully', async () => {
      // ⚠️ FIX: Remove Prisma findFirst mock, as validation service handles uniqueness
      prisma.documentType.create.mockResolvedValue(mockDocumentType);

      const result = await service.create({ name: 'Insurance Certificate' });

      expect(
        mockDocumentTypeValidationService.validateCreate,
      ).toHaveBeenCalledWith('Insurance Certificate');
      expect(result.name).toBe('Insurance Certificate');
      expect(prisma.documentType.create).toHaveBeenCalledWith({
        data: { name: 'Insurance Certificate' },
      });
      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining('Creating document type'),
      );
    });

    it('should throw ConflictException if document type already exists (case-insensitive)', async () => {
      // ⚠️ FIX: Mock the validation service to throw the exception
      mockDocumentTypeValidationService.validateCreate.mockRejectedValueOnce(
        new ConflictException(
          'Document type with name "Insurance Certificate" already exists',
        ),
      );
      // Remove Prisma findFirst mock

      await expect(
        service.create({ name: 'Insurance Certificate' }),
      ).rejects.toThrow(ConflictException);

      // Removed the logger.warn check because the warning is now expected to come from the validation service, not the service layer.
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
        } as DocumentType,
        {
          id: '2',
          name: 'Pollution Certificate',
          createdAt: new Date(),
          updatedAt: new Date(),
        } as DocumentType,
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
        } as DocumentType,
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
      prisma.documentType.findUnique.mockResolvedValue(mockDocumentType);
      const result = await service.findOne('1');
      expect(result.name).toBe(mockDocumentType.name);
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
      const newName = 'Updated Certificate';

      prisma.documentType.update.mockResolvedValue({
        ...mockDocumentType,
        name: newName,
      });

      const result = await service.update('1', { name: newName });

      expect(
        mockDocumentTypeValidationService.validateUpdate,
      ).toHaveBeenCalledWith('1', newName);
      expect(result.name).toBe(newName);
      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining('Updating document type'),
      );
    });

    it('should throw NotFoundException if document type not found', async () => {
      mockDocumentTypeValidationService.validateUpdate.mockRejectedValueOnce(
        new NotFoundException('Document type with id "x" not found'),
      );
      // Remove prisma.documentType.findUnique mock

      await expect(service.update('x', { name: 'New Name' })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ConflictException if new name already exists', async () => {
      mockDocumentTypeValidationService.validateUpdate.mockRejectedValueOnce(
        new ConflictException(
          'Document type with name "New Certificate" already exists',
        ),
      );

      await expect(
        service.update('1', { name: 'New Certificate' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  // ────────────────────────────────────────────────
  // REMOVE
  // ────────────────────────────────────────────────
  describe('remove', () => {
    // NOTE: This test block remains untouched as it does not use the new validation service pattern
    it('should throw NotFoundException if document type not found', async () => {
      prisma.documentType.findUnique.mockResolvedValue(null);
      await expect(service.remove('abc')).rejects.toThrow(NotFoundException);
      expect(logger.warn).toHaveBeenCalledWith(
        expect.stringContaining('not found'),
      );
    });
  });
});
