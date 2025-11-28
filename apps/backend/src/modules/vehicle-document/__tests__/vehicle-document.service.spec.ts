import { VehicleDocumentService } from '../vehicle-document.service';
import { createTestModule } from '../../../../test/utils/test-setup';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { MockedPrisma } from '../../../../test/utils/mock-prisma';
import { MockedLogger } from '../../../../test/utils/mock-logger';
import { CreateVehicleDocumentDto } from '../dto/create-vehicle-document.dto';
import { UpdateVehicleDocumentDto } from '../dto/update-vehicle-document.dto';
import { mapVehicleDocumentToResponse } from '../vehicle-document.mapper';
import { VehicleDocument, Vehicle, DocumentType } from '@prisma/client';
import { VehicleDocumentValidationService } from '../validation/vehicle-document-validation.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

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
  // validateCreate returns { vehicle, documentType }
  validateCreate: jest.fn().mockResolvedValue({
    vehicle: mockVehicle,
    documentType: mockDocType,
  }),

  // validateUpdate returns { vehicleDocument, vehicle?, documentType?, start?, expiry? }
  validateUpdate: jest.fn().mockImplementation(() => ({
    vehicleDocument: mockVehicleDoc,
    vehicle: mockVehicle,
    documentType: mockDocType,
    start: mockVehicleDoc.startDate,
    expiry: mockVehicleDoc.expiryDate,
  })),
};

// Create a proper mock for EventEmitter2
const createMockEventEmitter = () => {
  const mock = {
    emit: jest.fn().mockReturnValue(true),
    emitAsync: jest.fn().mockResolvedValue([]),
    addListener: jest.fn(),
    on: jest.fn(),
    prependListener: jest.fn(),
    once: jest.fn(),
    prependOnceListener: jest.fn(),
    removeListener: jest.fn(),
    off: jest.fn(),
    removeAllListeners: jest.fn(),
    setMaxListeners: jest.fn(),
    getMaxListeners: jest.fn().mockReturnValue(10),
    listeners: jest.fn().mockReturnValue([]),
    rawListeners: jest.fn().mockReturnValue([]),
    listenerCount: jest.fn().mockReturnValue(0),
    eventNames: jest.fn().mockReturnValue([]),
    prependAnyListener: jest.fn(),
    prependAnyOnceListener: jest.fn(),
    addAnyListener: jest.fn(),
    onAny: jest.fn(),
    offAny: jest.fn(),
    removeAnyListener: jest.fn(),
    removeAllAnyListeners: jest.fn(),
    anyListeners: jest.fn().mockReturnValue([]),
    anyListenerCount: jest.fn().mockReturnValue(0),
    hasListeners: jest.fn().mockReturnValue(false),
  };
  return mock;
};

describe('VehicleDocumentService', () => {
  let service: VehicleDocumentService;
  let prisma: MockedPrisma;
  let logger: MockedLogger;
  let eventEmitter: ReturnType<typeof createMockEventEmitter>;

  beforeEach(async () => {
    jest.clearAllMocks();

    // Resetting default mock implementation for consistency
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

    // Create new event emitter mock for each test
    eventEmitter = createMockEventEmitter();

    const setup = await createTestModule(VehicleDocumentService, [
      {
        provide: VehicleDocumentValidationService,
        useValue: mockVehicleDocumentValidationService,
      },
      {
        provide: EventEmitter2,
        useValue: eventEmitter,
      },
    ]);
    service = setup.service;
    prisma = setup.mocks.prisma;
    logger = setup.mocks.logger;
  });

  afterEach(() => jest.clearAllMocks());

  // ----------------------------------------------------------------
  // CREATE
  // ----------------------------------------------------------------

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
      expect(mapVehicleDocumentToResponse).toHaveBeenCalledWith(mockVehicleDoc);
      expect(result.documentNo).toBe('DL-ABC-2025');
      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining('Creating'),
      );
      // Verify event was emitted
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'vehicleDocument.created',
        mockVehicleDoc,
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
      // Verify event was NOT emitted on error
      expect(eventEmitter.emit).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if vehicle does not exist', async () => {
      mockVehicleDocumentValidationService.validateCreate.mockRejectedValueOnce(
        new NotFoundException('Vehicle with id veh-1 not found'),
      );
      await expect(service.create(dto)).rejects.toThrow(NotFoundException);
      expect(
        mockVehicleDocumentValidationService.validateCreate,
      ).toHaveBeenCalled();
      expect(eventEmitter.emit).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if document type does not exist', async () => {
      mockVehicleDocumentValidationService.validateCreate.mockRejectedValueOnce(
        new NotFoundException('DocumentType with id doctype-1 not found'),
      );
      await expect(service.create(dto)).rejects.toThrow(NotFoundException);
      expect(
        mockVehicleDocumentValidationService.validateCreate,
      ).toHaveBeenCalled();
      expect(eventEmitter.emit).not.toHaveBeenCalled();
    });
  });

  // ----------------------------------------------------------------
  // FIND ALL
  // ----------------------------------------------------------------

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
      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining('Fetched'),
      );
    });

    it('should handle empty result', async () => {
      prisma.vehicleDocument.findMany.mockResolvedValue([]);
      prisma.vehicleDocument.count.mockResolvedValue(0);

      const result = await service.findAll({});
      expect(result.items).toEqual([]);
      expect(result.total).toBe(0);
    });
  });

  // ----------------------------------------------------------------
  // FIND ONE
  // ----------------------------------------------------------------

  describe('findOne', () => {
    it('should return document if found', async () => {
      prisma.vehicleDocument.findUnique.mockResolvedValue(mockVehicleDoc);
      const result = await service.findOne('doc-1');

      expect(result.id).toBe('doc-1');
      expect(mapVehicleDocumentToResponse).toHaveBeenCalledWith(mockVehicleDoc);
    });

    it('should throw NotFoundException if not found', async () => {
      prisma.vehicleDocument.findUnique.mockResolvedValue(null);
      await expect(service.findOne('missing')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ----------------------------------------------------------------
  // UPDATE
  // ----------------------------------------------------------------

  describe('update', () => {
    const dto: UpdateVehicleDocumentDto = {
      notes: 'Updated note',
      expiryDate: new Date('2026-12-31'),
    };

    it('should update document successfully and emit event when expiry changes', async () => {
      // Mock the current document with a different expiry date
      const existingDocWithDifferentExpiry = {
        ...mockVehicleDoc,
        expiryDate: new Date('2026-06-30'),
      };

      prisma.vehicleDocument.findUnique.mockResolvedValue(
        existingDocWithDifferentExpiry,
      );

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
      expect(prisma.vehicleDocument.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'doc-1' } }),
      );
      expect(result.notes).toBe('Updated note');
      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining('Updating'),
      );
      // Verify event was emitted due to expiry date change
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'vehicleDocument.updated',
        updatedDoc,
      );
    });

    it('should update document successfully without emitting event when expiry does not change', async () => {
      // Mock the current document with same expiry date
      const existingDocWithSameExpiry = {
        ...mockVehicleDoc,
        expiryDate: dto.expiryDate,
      };

      prisma.vehicleDocument.findUnique.mockResolvedValue(
        existingDocWithSameExpiry,
      );

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

      expect(result.notes).toBe('Updated note');
      // Verify event was NOT emitted since expiry date didn't change
      expect(eventEmitter.emit).not.toHaveBeenCalledWith(
        'vehicleDocument.updated',
        expect.anything(),
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
      expect(eventEmitter.emit).not.toHaveBeenCalled();
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
      expect(eventEmitter.emit).not.toHaveBeenCalled();
    });
  });

  // ----------------------------------------------------------------
  // REMOVE
  // ----------------------------------------------------------------

  describe('remove', () => {
    it('should delete document successfully', async () => {
      prisma.vehicleDocument.findUnique.mockResolvedValue(mockVehicleDoc);
      prisma.vehicleDocument.delete.mockResolvedValue(mockVehicleDoc);

      const result = await service.remove('doc-1');

      expect(result).toEqual({ success: true });
      expect(prisma.vehicleDocument.delete).toHaveBeenCalledWith({
        where: { id: 'doc-1' },
      });
      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining('Deleting'),
      );
    });

    it('should throw NotFoundException if not found', async () => {
      prisma.vehicleDocument.findUnique.mockResolvedValue(null);
      await expect(service.remove('missing')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
