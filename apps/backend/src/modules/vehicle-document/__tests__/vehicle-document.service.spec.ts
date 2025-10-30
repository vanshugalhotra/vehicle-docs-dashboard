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

describe('VehicleDocumentService', () => {
  let service: VehicleDocumentService;
  let prisma: MockedPrisma;
  let logger: MockedLogger;

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

  afterEach(() => jest.clearAllMocks()); // ----------------------------------------------------------------
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
      // ⚠️ FIX: Remove all Prisma validation mocks
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
    });

    it('should throw ConflictException if documentNo already exists', async () => {
      // ⚠️ FIX: Mock the validation service to throw ConflictException
      mockVehicleDocumentValidationService.validateCreate.mockRejectedValueOnce(
        new ConflictException(
          'Document with number "DL-ABC-2025" already exists',
        ),
      ); // Remove Prisma findFirst mock
      await expect(service.create(dto)).rejects.toThrow(ConflictException);
      expect(
        mockVehicleDocumentValidationService.validateCreate,
      ).toHaveBeenCalled();
    });

    it('should throw NotFoundException if vehicle does not exist', async () => {
      // ⚠️ FIX: Mock the validation service to throw NotFoundException
      mockVehicleDocumentValidationService.validateCreate.mockRejectedValueOnce(
        new NotFoundException('Vehicle with id veh-1 not found'),
      ); // Remove Prisma vehicle.findUnique mock
      await expect(service.create(dto)).rejects.toThrow(NotFoundException);
      expect(
        mockVehicleDocumentValidationService.validateCreate,
      ).toHaveBeenCalled();
    });

    it('should throw NotFoundException if document type does not exist', async () => {
      // ⚠️ FIX: Mock the validation service to throw NotFoundException
      mockVehicleDocumentValidationService.validateCreate.mockRejectedValueOnce(
        new NotFoundException('DocumentType with id doctype-1 not found'),
      ); // Remove Prisma documentType.findUnique mock
      await expect(service.create(dto)).rejects.toThrow(NotFoundException);
      expect(
        mockVehicleDocumentValidationService.validateCreate,
      ).toHaveBeenCalled();
    });
  }); // ----------------------------------------------------------------
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
  }); // ----------------------------------------------------------------
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
  }); // ----------------------------------------------------------------
  // UPDATE
  // ----------------------------------------------------------------

  describe('update', () => {
    const dto: UpdateVehicleDocumentDto = {
      notes: 'Updated note',
      expiryDate: new Date('2026-12-31'),
    };

    it('should update document successfully', async () => {
      // ⚠️ FIX: The validation mock handles all existence/uniqueness checks.
      // Configure it to return the entities needed for the update.
      mockVehicleDocumentValidationService.validateUpdate.mockResolvedValueOnce(
        {
          vehicleDocument: mockVehicleDoc,
          vehicle: mockVehicle,
          documentType: mockDocType,
          start: mockVehicleDoc.startDate,
          expiry: dto.expiryDate, // Use the updated expiry date
        },
      );
      // Remove all Prisma validation mocks (findUnique/findFirst/etc)

      prisma.vehicleDocument.update.mockResolvedValue({
        ...mockVehicleDoc,
        notes: 'Updated note',
      });

      const result = await service.update('doc-1', dto);

      expect(
        mockVehicleDocumentValidationService.validateUpdate,
      ).toHaveBeenCalledWith(
        'doc-1',
        undefined, // documentNo not provided in DTO
        undefined, // vehicleId not provided in DTO
        undefined, // documentTypeId not provided in DTO
        undefined, // startDate not provided in DTO
        dto.expiryDate,
      );
      expect(prisma.vehicleDocument.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'doc-1' } }),
      );
      expect(result.notes).toBe('Updated note');
      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining('Updating'),
      );
    });

    it('should throw NotFoundException if not found', async () => {
      // ⚠️ FIX: Mock the validation service to throw NotFoundException
      mockVehicleDocumentValidationService.validateUpdate.mockRejectedValueOnce(
        new NotFoundException('VehicleDocument with id missing not found'),
      ); // Remove prisma.vehicleDocument.findUnique mock
      await expect(service.update('missing', dto)).rejects.toThrow(
        NotFoundException,
      );
      expect(
        mockVehicleDocumentValidationService.validateUpdate,
      ).toHaveBeenCalled();
    });

    it('should throw ConflictException if duplicate documentNo', async () => {
      // ⚠️ FIX: Mock the validation service to throw ConflictException
      mockVehicleDocumentValidationService.validateUpdate.mockRejectedValueOnce(
        new ConflictException('Document with number "DL-XYZ" already exists'),
      ); // Remove prisma.vehicleDocument.findUnique/findFirst mocks
      await expect(
        service.update('doc-1', { documentNo: 'DL-XYZ' }),
      ).rejects.toThrow(ConflictException);
      expect(
        mockVehicleDocumentValidationService.validateUpdate,
      ).toHaveBeenCalled();
    });
  }); // ----------------------------------------------------------------
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
