import { VehicleDocumentService } from '../vehicle-document.service';
import { createTestModule } from '../../../../test/utils/unit-setup/test-setup';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { MockedPrisma } from '../../../../test/utils/unit-setup/mock-prisma';
import { MockedLogger } from '../../../../test/utils/unit-setup/mock-logger';
import { CreateVehicleDocumentDto } from '../dto/create-vehicle-document.dto';
import { UpdateVehicleDocumentDto } from '../dto/update-vehicle-document.dto';
import { VehicleDocument, Vehicle, DocumentType } from '@prisma/client';
import { VehicleDocumentValidationService } from '../validation/vehicle-document-validation.service';

jest.mock('../vehicle-document.mapper', () => ({
  mapVehicleDocumentToResponse: jest.fn((doc: Partial<VehicleDocument>) => ({
    id: doc.id,
    documentNo: doc.documentNo,
    vehicleId: doc.vehicleId,
    documentTypeId: doc.documentTypeId,
    startDate: doc.startDate,
    expiryDate: doc.expiryDate,
    notes: doc.notes,
    link: doc.link,
  })),
}));

const mockVehicle = { id: 'veh-1', name: 'Car - PB04' } as Vehicle;
const mockDocType = { id: 'doctype-1', name: 'Insurance' } as DocumentType;

const mockVehicleDoc: VehicleDocument = {
  id: 'doc-1',
  vehicleId: 'veh-1',
  documentTypeId: 'doctype-1',
  documentNo: 'DL-ABC-2025',
  startDate: new Date('2025-10-01'),
  expiryDate: new Date('2026-10-01'),
  notes: 'Test note',
  link: 'https://example.com/doc1.pdf',
  createdById: 'user-1',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockVehicleDocumentValidationService = {
  validateCreate: jest.fn().mockResolvedValue({
    vehicle: mockVehicle,
    documentType: mockDocType,
  }),
  validateUpdate: jest.fn().mockImplementation(() => ({
    vehicleDocument: mockVehicleDoc,
    vehicle: mockVehicle,
    documentType: mockDocType,
    start: mockVehicleDoc.startDate,
    expiry: mockVehicleDoc.expiryDate,
  })),
};

describe('VehicleDocumentService', () => {
  let service: VehicleDocumentService;
  let prisma: MockedPrisma;
  let logger: MockedLogger;

  beforeEach(async () => {
    jest.clearAllMocks();
    mockVehicleDocumentValidationService.validateCreate.mockResolvedValue({
      vehicle: mockVehicle,
      documentType: mockDocType,
    });
    mockVehicleDocumentValidationService.validateUpdate.mockImplementation(
      () => ({
        vehicleDocument: mockVehicleDoc,
        vehicle: mockVehicle,
        documentType: mockDocType,
        start: mockVehicleDoc.startDate,
        expiry: mockVehicleDoc.expiryDate,
      }),
    );

    const setup = await createTestModule(VehicleDocumentService, [
      {
        provide: VehicleDocumentValidationService,
        useValue: mockVehicleDocumentValidationService,
      },
    ]);
    service = setup.service;
    prisma = setup.mocks.prisma;
    logger = setup.mocks.logger;
  });

  afterEach(() => jest.clearAllMocks());

  describe('create', () => {
    const dto: CreateVehicleDocumentDto = {
      vehicleId: 'veh-1',
      documentTypeId: 'doctype-1',
      documentNo: 'DL-ABC-2025',
      startDate: new Date('2025-10-01'),
      expiryDate: new Date('2026-10-01'),
      notes: 'Insurance valid for a year',
      link: 'https://example.com/insurance.pdf',
    };

    it('should create a vehicle document successfully', async () => {
      prisma.vehicleDocument.create.mockResolvedValue(mockVehicleDoc);

      const result = await service.create(dto);

      expect(
        mockVehicleDocumentValidationService.validateCreate,
      ).toHaveBeenCalledWith(
        dto.documentNo,
        dto.vehicleId,
        dto.documentTypeId,
        dto.startDate,
        dto.expiryDate,
      );
      expect(result.documentNo).toBe('DL-ABC-2025');
      expect(logger.logInfo).toHaveBeenCalledWith(
        expect.stringContaining('Creating'),
        expect.any(Object),
      );
      expect(logger.logInfo).toHaveBeenCalledWith(
        expect.stringContaining('Vehicle document created'),
        expect.any(Object),
      );
    });

    it('should throw ConflictException if documentNo already exists', async () => {
      mockVehicleDocumentValidationService.validateCreate.mockRejectedValueOnce(
        new ConflictException(
          'Document with number "DL-ABC-2025" already exists',
        ),
      );

      await expect(service.create(dto)).rejects.toThrow(ConflictException);
      expect(
        mockVehicleDocumentValidationService.validateCreate,
      ).toHaveBeenCalled();
      expect(logger.logError).toHaveBeenCalledWith(
        expect.stringContaining('Failed'),
        expect.any(Object),
      );
    });

    it('should throw NotFoundException if vehicle does not exist', async () => {
      mockVehicleDocumentValidationService.validateCreate.mockRejectedValueOnce(
        new NotFoundException('Vehicle with id veh-1 not found'),
      );

      await expect(service.create(dto)).rejects.toThrow(NotFoundException);
      expect(
        mockVehicleDocumentValidationService.validateCreate,
      ).toHaveBeenCalled();
      expect(logger.logError).toHaveBeenCalledWith(
        expect.stringContaining('Failed'),
        expect.any(Object),
      );
    });

    it('should throw NotFoundException if document type does not exist', async () => {
      mockVehicleDocumentValidationService.validateCreate.mockRejectedValueOnce(
        new NotFoundException('DocumentType with id doctype-1 not found'),
      );

      await expect(service.create(dto)).rejects.toThrow(NotFoundException);
      expect(
        mockVehicleDocumentValidationService.validateCreate,
      ).toHaveBeenCalled();
      expect(logger.logError).toHaveBeenCalledWith(
        expect.stringContaining('Failed'),
        expect.any(Object),
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated list of documents', async () => {
      prisma.vehicleDocument.findMany.mockResolvedValue([mockVehicleDoc]);
      prisma.vehicleDocument.count.mockResolvedValue(1);

      const result = await service.findAll({ skip: 0, take: 10 });

      expect(prisma.vehicleDocument.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 0, take: 10 }),
      );
      expect(result.items).toHaveLength(1);
      expect(result.items[0].documentNo).toBe('DL-ABC-2025');
      expect(result.total).toBe(1);
      expect(logger.logInfo).toHaveBeenCalledWith(
        expect.stringContaining('Fetching'),
        expect.any(Object),
      );
      expect(logger.logInfo).toHaveBeenCalledWith(
        expect.stringContaining('Fetched'),
        expect.any(Object),
      );
    });

    it('should handle empty result', async () => {
      prisma.vehicleDocument.findMany.mockResolvedValue([]);
      prisma.vehicleDocument.count.mockResolvedValue(0);

      const result = await service.findAll({});

      expect(result.items).toEqual([]);
      expect(result.total).toBe(0);
      expect(logger.logInfo).toHaveBeenCalledWith(
        expect.stringContaining('Fetching'),
        expect.any(Object),
      );
    });
  });

  describe('findOne', () => {
    it('should return document if found', async () => {
      prisma.vehicleDocument.findUnique.mockResolvedValue(mockVehicleDoc);

      const result = await service.findOne('doc-1');

      expect(result.id).toBe('doc-1');
      expect(logger.logInfo).toHaveBeenCalledWith(
        expect.stringContaining('Fetching'),
        expect.any(Object),
      );
    });

    it('should throw NotFoundException if not found', async () => {
      prisma.vehicleDocument.findUnique.mockResolvedValue(null);

      await expect(service.findOne('missing')).rejects.toThrow(
        NotFoundException,
      );
      expect(logger.logWarn).toHaveBeenCalledWith(
        expect.stringContaining('not found'),
        expect.any(Object),
      );
    });
  });

  describe('update', () => {
    const dto: UpdateVehicleDocumentDto = {
      notes: 'Updated note',
      expiryDate: new Date('2026-12-31'),
    };

    it('should update document successfully', async () => {
      prisma.vehicleDocument.findUnique.mockResolvedValue(mockVehicleDoc);

      mockVehicleDocumentValidationService.validateUpdate.mockResolvedValueOnce(
        {
          vehicleDocument: mockVehicleDoc,
          vehicle: mockVehicle,
          documentType: mockDocType,
          start: mockVehicleDoc.startDate,
          expiry: dto.expiryDate,
        },
      );

      const updatedDoc = {
        ...mockVehicleDoc,
        notes: 'Updated note',
        expiryDate: dto.expiryDate,
      };

      prisma.vehicleDocument.update.mockResolvedValue(updatedDoc);

      const result = await service.update('doc-1', dto);

      expect(
        mockVehicleDocumentValidationService.validateUpdate,
      ).toHaveBeenCalledWith(
        'doc-1',
        undefined,
        undefined,
        undefined,
        undefined,
        dto.expiryDate,
      );
      expect(result.notes).toBe('Updated note');
      expect(logger.logInfo).toHaveBeenCalledWith(
        expect.stringContaining('Updating'),
        expect.any(Object),
      );
      expect(logger.logInfo).toHaveBeenCalledWith(
        expect.stringContaining('Vehicle document updated'),
        expect.any(Object),
      );
    });

    it('should throw NotFoundException if not found', async () => {
      mockVehicleDocumentValidationService.validateUpdate.mockRejectedValueOnce(
        new NotFoundException('VehicleDocument with id missing not found'),
      );

      await expect(service.update('missing', dto)).rejects.toThrow(
        NotFoundException,
      );
      expect(
        mockVehicleDocumentValidationService.validateUpdate,
      ).toHaveBeenCalled();
      expect(logger.logError).toHaveBeenCalledWith(
        expect.stringContaining('Failed'),
        expect.any(Object),
      );
    });

    it('should throw ConflictException if duplicate documentNo', async () => {
      mockVehicleDocumentValidationService.validateUpdate.mockRejectedValueOnce(
        new ConflictException('Document with number "DL-XYZ" already exists'),
      );

      await expect(
        service.update('doc-1', { documentNo: 'DL-XYZ' }),
      ).rejects.toThrow(ConflictException);
      expect(
        mockVehicleDocumentValidationService.validateUpdate,
      ).toHaveBeenCalled();
      expect(logger.logError).toHaveBeenCalledWith(
        expect.stringContaining('Failed'),
        expect.any(Object),
      );
    });
  });

  describe('remove', () => {
    it('should delete document successfully', async () => {
      prisma.vehicleDocument.findUnique.mockResolvedValue(mockVehicleDoc);
      prisma.vehicleDocument.delete.mockResolvedValue(mockVehicleDoc);

      const result = await service.remove('doc-1');

      expect(result).toEqual({ success: true });
      expect(prisma.vehicleDocument.delete).toHaveBeenCalledWith({
        where: { id: 'doc-1' },
      });
      expect(logger.logInfo).toHaveBeenCalledWith(
        expect.stringContaining('Deleting'),
        expect.any(Object),
      );
      expect(logger.logInfo).toHaveBeenCalledWith(
        expect.stringContaining('Vehicle document deleted'),
        expect.any(Object),
      );
    });

    it('should throw NotFoundException if not found', async () => {
      prisma.vehicleDocument.findUnique.mockResolvedValue(null);

      await expect(service.remove('missing')).rejects.toThrow(
        NotFoundException,
      );
      expect(logger.logWarn).toHaveBeenCalledWith(
        expect.stringContaining('not found'),
        expect.any(Object),
      );
    });
  });
});
