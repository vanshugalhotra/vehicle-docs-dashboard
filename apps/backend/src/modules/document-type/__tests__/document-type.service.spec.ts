import { DocumentTypesService } from '../document-type.service';
import { createTestModule } from '../../../../test/utils/unit-setup/test-setup';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { MockedPrisma } from '../../../../test/utils/unit-setup/mock-prisma';
import { MockedLogger } from '../../../../test/utils/unit-setup/mock-logger';
import { DocumentTypeValidationService } from '../validation/document-type-validation.service';
import { DocumentType } from '@prisma/client';
import { AuditService } from 'src/modules/audit/audit.service';

const mockDocumentType: DocumentType = {
  id: 'doc1',
  name: 'Insurance Certificate',
  createdAt: new Date(),
  updatedAt: new Date(),
};
const mockAuditService = {
  record: jest.fn().mockResolvedValue(undefined),
};
const mockDocumentTypeValidationService = {
  validateCreate: jest.fn().mockResolvedValue(null),
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
    jest.clearAllMocks();
    mockDocumentTypeValidationService.validateCreate.mockResolvedValue(null);
    mockAuditService.record.mockResolvedValue(undefined);
    mockDocumentTypeValidationService.validateUpdate.mockImplementation(
      (id: string, name?: string) =>
        ({
          ...mockDocumentType,
          id,
          name: name ?? mockDocumentType.name,
        }) as DocumentType,
    );

    const setup = await createTestModule(DocumentTypesService, [
      {
        provide: DocumentTypeValidationService,
        useValue: mockDocumentTypeValidationService,
      },
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
    it('should create document type successfully', async () => {
      prisma.documentType.create.mockResolvedValue(mockDocumentType);

      const result = await service.create({ name: 'Insurance Certificate' });

      expect(
        mockDocumentTypeValidationService.validateCreate,
      ).toHaveBeenCalledWith('Insurance Certificate');
      expect(result.name).toBe('Insurance Certificate');
      expect(prisma.documentType.create).toHaveBeenCalledWith({
        data: { name: 'Insurance Certificate' },
      });
      expect(logger.logInfo).toHaveBeenCalledWith(
        expect.stringContaining('Creating'),
        expect.any(Object),
      );
    });

    it('should throw ConflictException if document type already exists', async () => {
      mockDocumentTypeValidationService.validateCreate.mockRejectedValueOnce(
        new ConflictException(
          'Document type with name "Insurance Certificate" already exists',
        ),
      );

      await expect(
        service.create({ name: 'Insurance Certificate' }),
      ).rejects.toThrow(ConflictException);
      expect(logger.logError).toHaveBeenCalledWith(
        expect.stringContaining('Failed'),
        expect.any(Object),
      );
    });
  });

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
      prisma.documentType.count.mockResolvedValue(2);

      const result = await service.findAll({});

      expect(result.items).toHaveLength(2);
      expect(result.items[0].name).toBe('Insurance Certificate');
      expect(logger.logDebug).toHaveBeenCalledWith(
        expect.stringContaining('Fetching'),
        expect.any(Object),
      );
      expect(logger.logInfo).toHaveBeenCalledWith(
        expect.stringContaining('Fetched'),
        expect.any(Object),
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
      prisma.documentType.count.mockResolvedValue(1);

      const result = await service.findAll({ search: 'insurance' });

      expect(result.items).toHaveLength(1);
      expect(logger.logDebug).toHaveBeenCalledWith(
        expect.stringContaining('Fetching'),
        expect.any(Object),
      );
    });
  });

  describe('findOne', () => {
    it('should return document type by id', async () => {
      prisma.documentType.findUnique.mockResolvedValue(mockDocumentType);

      const result = await service.findOne('1');

      expect(result.name).toBe(mockDocumentType.name);
      expect(logger.logInfo).toHaveBeenCalledWith(
        expect.stringContaining('Fetching'),
        expect.any(Object),
      );
    });

    it('should throw NotFoundException if document type not found', async () => {
      prisma.documentType.findUnique.mockResolvedValue(null);

      await expect(service.findOne('xyz')).rejects.toThrow(NotFoundException);
      expect(logger.logWarn).toHaveBeenCalledWith(
        expect.stringContaining('not found'),
        expect.any(Object),
      );
    });
  });

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
      expect(logger.logInfo).toHaveBeenCalledWith(
        expect.stringContaining('Updating'),
        expect.any(Object),
      );
      expect(logger.logInfo).toHaveBeenCalledWith(
        expect.stringContaining('Document type updated'),
        expect.any(Object),
      );
    });

    it('should throw NotFoundException if document type not found', async () => {
      mockDocumentTypeValidationService.validateUpdate.mockRejectedValueOnce(
        new NotFoundException('Document type with id "x" not found'),
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
      mockDocumentTypeValidationService.validateUpdate.mockRejectedValueOnce(
        new ConflictException(
          'Document type with name "New Certificate" already exists',
        ),
      );

      await expect(
        service.update('1', { name: 'New Certificate' }),
      ).rejects.toThrow(ConflictException);
      expect(logger.logError).toHaveBeenCalledWith(
        expect.stringContaining('Failed'),
        expect.any(Object),
      );
    });
  });

  describe('remove', () => {
    it('should delete document type successfully', async () => {
      prisma.documentType.findUnique.mockResolvedValue(mockDocumentType);
      prisma.vehicleDocument.count.mockResolvedValue(0);
      prisma.documentType.delete.mockResolvedValue(mockDocumentType);

      const result = await service.remove('doc1');

      expect(result.success).toBe(true);
      expect(logger.logInfo).toHaveBeenCalledWith(
        expect.stringContaining('Deleting'),
        expect.any(Object),
      );
      expect(logger.logInfo).toHaveBeenCalledWith(
        expect.stringContaining('Document type deleted'),
        expect.any(Object),
      );
    });

    it('should throw NotFoundException if document type not found', async () => {
      prisma.documentType.findUnique.mockResolvedValue(null);

      await expect(service.remove('abc')).rejects.toThrow(NotFoundException);
      expect(logger.logWarn).toHaveBeenCalledWith(
        expect.stringContaining('Delete failed'),
        expect.any(Object),
      );
    });

    it('should throw ConflictException if linked vehicle documents exist', async () => {
      prisma.documentType.findUnique.mockResolvedValue(mockDocumentType);
      prisma.vehicleDocument.count.mockResolvedValue(3);

      await expect(service.remove('doc1')).rejects.toThrow(ConflictException);
      expect(logger.logWarn).toHaveBeenCalledWith(
        expect.stringContaining('Cannot delete'),
        expect.any(Object),
      );
    });
  });
});
