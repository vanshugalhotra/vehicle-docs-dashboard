import { INestApplication } from '@nestjs/common';
import { Express } from 'express';
import { PrismaService } from '../src/prisma/prisma.service';
import {
  DocumentTypeResponse,
  VehicleCategoryResponse,
  VehicleDocumentResponse,
  VehicleResponse,
  VehicleTypeResponse,
} from 'src/common/types';
import { PaginatedVehicleDocumentResponseDto } from 'src/modules/vehicle-document/dto/vehicle-document-response.dto';
import { PaginatedCategoryResponseDto } from 'src/modules/vehicle-category/dto/vehicle-category-response.dto';
import { PaginatedTypeResponseDto } from 'src/modules/vehicle-type/dto/vehicle-type-response.dto';
import { setupTestAuth, authedRequest } from './utils/e2e-setup/auth-test';
import { createTestApp } from './utils/e2e-setup/app-setup';

describe('Vehicle Documents E2E (Comprehensive & Production-grade)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let server: Express;

  // reference IDs
  let vehicleIdA: string;
  let vehicleIdB: string;
  let documentTypeIdA: string;
  let documentTypeIdB: string;

  let vehicleDocA: VehicleDocumentResponse;
  let vehicleDocB: VehicleDocumentResponse;

  beforeAll(async () => {
    app = await createTestApp();
    prisma = app.get(PrismaService);
    server = app.getHttpServer() as unknown as Express;
    await setupTestAuth(server);

    // Clean up relevant tables before tests
    await prisma.vehicleDocument.deleteMany({});
    await prisma.vehicle.deleteMany({});
    await prisma.documentType.deleteMany({});
    await prisma.vehicleType.deleteMany({});
    await prisma.vehicleCategory.deleteMany({});

    // Create reference data via API
    // Create categories and types
    const catResA = await authedRequest(server)
      .post('/api/v1/vehicle-categories')
      .send({ name: 'Car' })
      .expect(201);
    const categoryIdA = (catResA.body as VehicleCategoryResponse).id;

    const typeResA = await authedRequest(server)
      .post('/api/v1/vehicle-types')
      .send({ name: 'Sedan', categoryId: categoryIdA })
      .expect(201);
    const typeIdA = (typeResA.body as VehicleTypeResponse).id;

    const catResB = await authedRequest(server)
      .post('/api/v1/vehicle-categories')
      .send({ name: 'Truck' })
      .expect(201);
    const categoryIdB = (catResB.body as VehicleCategoryResponse).id;

    const typeResB = await authedRequest(server)
      .post('/api/v1/vehicle-types')
      .send({ name: 'Mini-Truck', categoryId: categoryIdB })
      .expect(201);
    const typeIdB = (typeResB.body as VehicleTypeResponse).id;

    // Create vehicles
    const vehicleResA = await authedRequest(server)
      .post('/api/v1/vehicles')
      .send({
        licensePlate: 'DOC001',
        rcNumber: 'rc-doc-001',
        chassisNumber: 'ch-doc-001',
        engineNumber: 'en-doc-001',
        categoryId: categoryIdA,
        typeId: typeIdA,
      })
      .expect(201);
    vehicleIdA = (vehicleResA.body as VehicleResponse).id;

    const vehicleResB = await authedRequest(server)
      .post('/api/v1/vehicles')
      .send({
        licensePlate: 'DOC002',
        rcNumber: 'rc-doc-002',
        chassisNumber: 'ch-doc-002',
        engineNumber: 'en-doc-002',
        categoryId: categoryIdB,
        typeId: typeIdB,
      })
      .expect(201);
    vehicleIdB = (vehicleResB.body as VehicleResponse).id;

    // Create document types
    const docTypeResA = await authedRequest(server)
      .post('/api/v1/document-types')
      .send({ name: 'Insurance Certificate' })
      .expect(201);
    documentTypeIdA = (docTypeResA.body as DocumentTypeResponse).id;

    const docTypeResB = await authedRequest(server)
      .post('/api/v1/document-types')
      .send({ name: 'Pollution Certificate' })
      .expect(201);
    documentTypeIdB = (docTypeResB.body as DocumentTypeResponse).id;
  });

  afterAll(async () => {
    await prisma.vehicleDocument.deleteMany({});
    await prisma.vehicle.deleteMany({});
    await prisma.documentType.deleteMany({});
    await prisma.vehicleType.deleteMany({});
    await prisma.vehicleCategory.deleteMany({});
    await app.close();
  });

  // -----------------------------
  // CREATE - Happy path + validations
  // -----------------------------
  describe('Create Vehicle Document - validations and happy path', () => {
    it('should create vehicle document A (happy path) with all fields', async () => {
      const startDate = new Date('2025-01-01');
      const expiryDate = new Date('2026-01-01');

      const res = await authedRequest(server)
        .post('/api/v1/vehicle-documents')
        .send({
          vehicleId: vehicleIdA,
          documentTypeId: documentTypeIdA,
          documentNo: 'INS-001-2025',
          startDate: startDate.toISOString(),
          expiryDate: expiryDate.toISOString(),
          notes: 'Comprehensive insurance coverage',
          link: 'https://example.com/insurance-001.pdf',
        })
        .expect(201);

      vehicleDocA = res.body as VehicleDocumentResponse;
      expect(vehicleDocA.id).toBeDefined();
      expect(vehicleDocA.documentNo).toBe('INS-001-2025');
      expect(vehicleDocA.vehicleId).toBe(vehicleIdA);
      expect(vehicleDocA.documentTypeId).toBe(documentTypeIdA);
      expect(new Date(vehicleDocA.startDate).toISOString()).toBe(
        startDate.toISOString(),
      );
      expect(new Date(vehicleDocA.expiryDate).toISOString()).toBe(
        expiryDate.toISOString(),
      );
      expect(vehicleDocA.notes).toBe('Comprehensive insurance coverage');
      expect(vehicleDocA.link).toBe('https://example.com/insurance-001.pdf');
    });

    it('should create vehicle document B with minimal fields', async () => {
      const startDate = new Date('2025-02-01');
      const expiryDate = new Date('2026-02-01');

      const res = await authedRequest(server)
        .post('/api/v1/vehicle-documents')
        .send({
          vehicleId: vehicleIdB,
          documentTypeId: documentTypeIdB,
          documentNo: 'POL-001-2025',
          startDate: startDate.toISOString(),
          expiryDate: expiryDate.toISOString(),
        })
        .expect(201);

      vehicleDocB = res.body as VehicleDocumentResponse;
      expect(vehicleDocB.documentNo).toBe('POL-001-2025');
      expect(vehicleDocB.vehicleId).toBe(vehicleIdB);
      expect(vehicleDocB.documentTypeId).toBe(documentTypeIdB);
    });

    it('trim and create', async () => {
      const startDate = new Date('2025-03-01');
      const expiryDate = new Date('2026-03-01');

      await authedRequest(server)
        .post('/api/v1/vehicle-documents')
        .send({
          vehicleId: vehicleIdA,
          documentTypeId: documentTypeIdA,
          documentNo: '  trim-test-001  ',
          startDate: startDate.toISOString(),
          expiryDate: expiryDate.toISOString(),
        })
        .expect(201);
    });

    it('should reject creation with missing required fields (400)', async () => {
      await authedRequest(server)
        .post('/api/v1/vehicle-documents')
        .send({
          documentNo: 'TEST-001',
          // missing vehicleId, documentTypeId, dates
        })
        .expect(400);
    });

    it('should reject creation when vehicleId/documentTypeId invalid (404)', async () => {
      await authedRequest(server)
        .post('/api/v1/vehicle-documents')
        .send({
          vehicleId: '00000000-0000-0000-0000-000000000000',
          documentTypeId: documentTypeIdA,
          documentNo: 'TEST-404',
          startDate: new Date().toISOString(),
          expiryDate: new Date('2026-01-01').toISOString(),
        })
        .expect(404);

      await authedRequest(server)
        .post('/api/v1/vehicle-documents')
        .send({
          vehicleId: vehicleIdA,
          documentTypeId: '00000000-0000-0000-0000-000000000000',
          documentNo: 'TEST-404',
          startDate: new Date().toISOString(),
          expiryDate: new Date('2026-01-01').toISOString(),
        })
        .expect(404);
    });

    it('should enforce uniqueness on documentNo (case-insensitive) (409)', async () => {
      // try duplicate documentNo in different case -> should conflict
      await authedRequest(server)
        .post('/api/v1/vehicle-documents')
        .send({
          vehicleId: vehicleIdA,
          documentTypeId: documentTypeIdA,
          documentNo: 'ins-001-2025', // same as vehicleDocA (case-insensitive)
          startDate: new Date().toISOString(),
          expiryDate: new Date('2026-01-01').toISOString(),
        })
        .expect(409);
    });

    it('should reject invalid date ranges (400)', async () => {
      await authedRequest(server)
        .post('/api/v1/vehicle-documents')
        .send({
          vehicleId: vehicleIdA,
          documentTypeId: documentTypeIdA,
          documentNo: 'INVALID-DATES',
          startDate: new Date('2026-01-01').toISOString(), // start after expiry
          expiryDate: new Date('2025-01-01').toISOString(),
        })
        .expect(400);
    });

    it('should reject invalid date formats (400)', async () => {
      await authedRequest(server)
        .post('/api/v1/vehicle-documents')
        .send({
          vehicleId: vehicleIdA,
          documentTypeId: documentTypeIdA,
          documentNo: 'INVALID-DATE-FMT',
          startDate: 'invalid-date',
          expiryDate: new Date('2026-01-01').toISOString(),
        })
        .expect(400);
    });
  });

  // -----------------------------
  // READ / LIST / SIMPLE FILTERS
  // -----------------------------
  describe('List and fetch vehicle documents', () => {
    it('GET /vehicle-documents returns array and includes created documents', async () => {
      const res = await authedRequest(server)
        .get('/api/v1/vehicle-documents')
        .expect(200);
      const body = res.body as PaginatedVehicleDocumentResponseDto;
      expect(Array.isArray(body.items)).toBe(true);
      expect(body.items.some((doc) => doc.id === vehicleDocA.id)).toBe(true);
      expect(body.items.some((doc) => doc.id === vehicleDocB.id)).toBe(true);
    });

    it('GET /vehicle-documents/:id should return the document (200)', async () => {
      const res = await authedRequest(server)
        .get(`/api/v1/vehicle-documents/${vehicleDocA.id}`)
        .expect(200);
      expect((res.body as VehicleDocumentResponse).id).toBe(vehicleDocA.id);
    });

    it('GET /vehicle-documents/:id with invalid uuid -> 400', async () => {
      await authedRequest(server)
        .get('/api/v1/vehicle-documents/invalid-uuid')
        .expect(400);
    });

    it('GET /vehicle-documents/:id non-existent -> 404', async () => {
      await authedRequest(server)
        .get('/api/v1/vehicle-documents/00000000-0000-0000-0000-000000000000')
        .expect(404);
    });

    it('should include vehicle and documentType relations by default', async () => {
      const res = await authedRequest(server)
        .get(`/api/v1/vehicle-documents/${vehicleDocA.id}`)
        .expect(200);
      const doc = res.body as VehicleDocumentResponse;
      expect(doc.vehicleId).toBe(vehicleIdA);
      expect(doc.documentTypeId).toBe(documentTypeIdA);
    });
  });

  // -----------------------------
  // ADVANCED QUERY TESTS
  // -----------------------------
  describe('Vehicle Document query options', () => {
    let searchVehicleDoc: VehicleDocumentResponse;
    let searchVehicleId: string;
    let searchDocTypeId: string;

    beforeAll(async () => {
      // Create additional test data for searching/filtering
      const vehicleRes = await authedRequest(server)
        .post('/api/v1/vehicles')
        .send({
          licensePlate: 'SEARCH001',
          rcNumber: 'rc-search-001',
          chassisNumber: 'ch-search-001',
          engineNumber: 'en-search-001',
          categoryId: (
            (await authedRequest(server).get('/api/v1/vehicle-categories'))
              .body as PaginatedCategoryResponseDto
          ).items[0].id,
          typeId: (
            (await authedRequest(server).get('/api/v1/vehicle-types'))
              .body as PaginatedTypeResponseDto
          ).items[0].id,
        })
        .expect(201);
      searchVehicleId = (vehicleRes.body as VehicleResponse).id;

      const docTypeRes = await authedRequest(server)
        .post('/api/v1/document-types')
        .send({ name: 'Fitness Certificate' })
        .expect(201);
      searchDocTypeId = (docTypeRes.body as DocumentTypeResponse).id;

      // Create a test document to search/filter/sort
      const docRes = await authedRequest(server)
        .post('/api/v1/vehicle-documents')
        .send({
          vehicleId: searchVehicleId,
          documentTypeId: searchDocTypeId,
          documentNo: `SRCH-${Math.floor(Math.random() * 10000)}`,
          startDate: new Date('2025-01-01').toISOString(),
          expiryDate: new Date('2026-01-01').toISOString(),
          notes: 'Special searchable document with unique notes',
        })
        .expect(201);
      searchVehicleDoc = docRes.body as VehicleDocumentResponse;
    });

    it('should support full-text search via ?search= on documentNo and vehicle name', async () => {
      // Search by document number
      const resByDocNo = await authedRequest(server)
        .get(
          `/api/v1/vehicle-documents?search=${encodeURIComponent(searchVehicleDoc.documentNo)}`,
        )
        .expect(200);
      const bodyByDocNo =
        resByDocNo.body as PaginatedVehicleDocumentResponseDto;
      expect(
        bodyByDocNo.items.some((doc) => doc.id === searchVehicleDoc.id),
      ).toBe(true);

      // Search by vehicle name (license plate)
      const resByVehicle = await authedRequest(server)
        .get('/api/v1/vehicle-documents?search=SEARCH001')
        .expect(200);
      const bodyByVehicle =
        resByVehicle.body as PaginatedVehicleDocumentResponseDto;
      expect(
        bodyByVehicle.items.some((doc) => doc.vehicleId === searchVehicleId),
      ).toBe(true);
    });

    it('should support filtering by vehicleId, documentTypeId, and date ranges', async () => {
      const filters = {
        vehicleId: searchVehicleId,
        documentTypeId: searchDocTypeId,
      };

      const res = await authedRequest(server)
        .get(
          `/api/v1/vehicle-documents?filters=${encodeURIComponent(JSON.stringify(filters))}`,
        )
        .expect(200);
      const body = res.body as PaginatedVehicleDocumentResponseDto;

      expect(
        body.items.every(
          (doc) =>
            doc.vehicleId === searchVehicleId &&
            doc.documentTypeId === searchDocTypeId,
        ),
      ).toBe(true);
    });

    it('should support filtering by expiry date ranges', async () => {
      const futureDate = new Date('2027-01-01').toISOString();
      const filters = {
        expiryDate: { gte: futureDate },
      };

      const res = await authedRequest(server)
        .get(
          `/api/v1/vehicle-documents?filters=${encodeURIComponent(JSON.stringify(filters))}`,
        )
        .expect(200);
      const body = res.body as PaginatedVehicleDocumentResponseDto;

      // Should only return documents expiring after the future date
      if (body.items.length > 0) {
        body.items.forEach((doc) => {
          expect(new Date(doc.expiryDate).getTime()).toBeGreaterThanOrEqual(
            new Date(futureDate).getTime(),
          );
        });
      }
    });

    it('should support sorting by various fields', async () => {
      // Sort by documentNo ascending
      const asc = await authedRequest(server)
        .get('/api/v1/vehicle-documents?sortBy=documentNo&order=asc&take=5')
        .expect(200);

      // Sort by expiryDate descending (most recent first)
      const desc = await authedRequest(server)
        .get('/api/v1/vehicle-documents?sortBy=expiryDate&order=desc&take=5')
        .expect(200);

      const ascBody = asc.body as PaginatedVehicleDocumentResponseDto;
      const descBody = desc.body as PaginatedVehicleDocumentResponseDto;

      // Verify sorting works
      if (ascBody.items.length > 1) {
        const first = ascBody.items[0].documentNo;
        const last = ascBody.items[ascBody.items.length - 1].documentNo;
        expect(first <= last).toBe(true);
      }

      if (descBody.items.length > 1) {
        const first = new Date(descBody.items[0].expiryDate).getTime();
        const last = new Date(
          descBody.items[descBody.items.length - 1].expiryDate,
        ).getTime();
        expect(first >= last).toBe(true);
      }
    });

    it('should support pagination with skip and take', async () => {
      const page1 = await authedRequest(server)
        .get('/api/v1/vehicle-documents?skip=0&take=2')
        .expect(200);
      const page2 = await authedRequest(server)
        .get('/api/v1/vehicle-documents?skip=2&take=2')
        .expect(200);

      const page1Body = page1.body as PaginatedVehicleDocumentResponseDto;
      const page2Body = page2.body as PaginatedVehicleDocumentResponseDto;

      expect(page1Body.items.length).toBeLessThanOrEqual(2);
      expect(page2Body.items.length).toBeLessThanOrEqual(2);

      // Ensure different pages have different items
      if (page1Body.items.length > 0 && page2Body.items.length > 0) {
        const page1Ids = page1Body.items.map((doc) => doc.id);
        const page2Ids = page2Body.items.map((doc) => doc.id);
        const commonIds = page1Ids.filter((id) => page2Ids.includes(id));
        expect(commonIds.length).toBe(0);
      }
    });

    it('should allow combining search + filter + pagination + sorting', async () => {
      const filters = { vehicleId: searchVehicleId };

      const res = await authedRequest(server)
        .get(
          `/api/v1/vehicle-documents?search=${encodeURIComponent(searchVehicleDoc.documentNo)}&filters=${encodeURIComponent(JSON.stringify(filters))}&sortBy=createdAt&order=desc&skip=0&take=3`,
        )
        .expect(200);

      const body = res.body as PaginatedVehicleDocumentResponseDto;
      expect(Array.isArray(body.items)).toBe(true);
      expect(body.items.length).toBeLessThanOrEqual(3);
    });
  });

  // -----------------------------
  // UPDATE - comprehensive scenarios
  // -----------------------------
  describe('Update Vehicle Document', () => {
    it('should reject after trimming', async () => {
      await authedRequest(server)
        .patch(`/api/v1/vehicle-documents/${vehicleDocB.id}`)
        .send({ documentNo: '  ins-001-2025  ' })
        .expect(409);
    });

    it('should update dates successfully', async () => {
      const newStartDate = new Date('2025-06-01');
      const newExpiryDate = new Date('2026-06-01');

      const res = await authedRequest(server)
        .patch(`/api/v1/vehicle-documents/${vehicleDocA.id}`)
        .send({
          startDate: newStartDate.toISOString(),
          expiryDate: newExpiryDate.toISOString(),
        })
        .expect(200);
      const updated = res.body as VehicleDocumentResponse;
      expect(new Date(updated.startDate).toISOString()).toBe(
        newStartDate.toISOString(),
      );
      expect(new Date(updated.expiryDate).toISOString()).toBe(
        newExpiryDate.toISOString(),
      );
    });

    it('should update notes and link fields', async () => {
      const res = await authedRequest(server)
        .patch(`/api/v1/vehicle-documents/${vehicleDocA.id}`)
        .send({
          notes: 'Updated comprehensive notes with more details',
          link: 'https://example.com/updated-document.pdf',
        })
        .expect(200);
      const updated = res.body as VehicleDocumentResponse;
      expect(updated.notes).toBe(
        'Updated comprehensive notes with more details',
      );
      expect(updated.link).toBe('https://example.com/updated-document.pdf');
    });

    it('should update vehicle and document type associations', async () => {
      const res = await authedRequest(server)
        .patch(`/api/v1/vehicle-documents/${vehicleDocB.id}`)
        .send({
          vehicleId: vehicleIdA, // Move to different vehicle
          documentTypeId: documentTypeIdA, // Change document type
        })
        .expect(200);
      const updated = res.body as VehicleDocumentResponse;
      expect(updated.vehicleId).toBe(vehicleIdA);
      expect(updated.documentTypeId).toBe(documentTypeIdA);
    });

    it('should reject update when changing to duplicate documentNo (case-insensitive)', async () => {
      await authedRequest(server)
        .patch(`/api/v1/vehicle-documents/${vehicleDocB.id}`)
        .send({ documentNo: 'ins-001-2025' }) // Same as vehicleDocA (case-insensitive)
        .expect(409);
    });

    it('should reject update with invalid vehicleId/documentTypeId (404)', async () => {
      await authedRequest(server)
        .patch(`/api/v1/vehicle-documents/${vehicleDocA.id}`)
        .send({ vehicleId: '00000000-0000-0000-0000-000000000000' })
        .expect(404);

      await authedRequest(server)
        .patch(`/api/v1/vehicle-documents/${vehicleDocA.id}`)
        .send({ documentTypeId: '00000000-0000-0000-0000-000000000000' })
        .expect(404);
    });

    it('should reject update with invalid date ranges (400)', async () => {
      await authedRequest(server)
        .patch(`/api/v1/vehicle-documents/${vehicleDocA.id}`)
        .send({
          startDate: new Date('2026-01-01').toISOString(),
          expiryDate: new Date('2025-01-01').toISOString(),
        })
        .expect(400);
    });

    it('should return 404 when updating non-existent document', async () => {
      await authedRequest(server)
        .patch('/api/v1/vehicle-documents/00000000-0000-0000-0000-000000000000')
        .send({ notes: 'ghost update' })
        .expect(404);
    });

    it('should allow partial updates (PATCH semantics)', async () => {
      // Update only notes
      const res1 = await authedRequest(server)
        .patch(`/api/v1/vehicle-documents/${vehicleDocA.id}`)
        .send({ notes: 'Partial update test' })
        .expect(200);
      expect((res1.body as VehicleDocumentResponse).notes).toBe(
        'Partial update test',
      );

      // Update only documentNo
      const res2 = await authedRequest(server)
        .patch(`/api/v1/vehicle-documents/${vehicleDocA.id}`)
        .send({ documentNo: 'PARTIAL-UPDATE' })
        .expect(200);
      expect((res2.body as VehicleDocumentResponse).documentNo).toBe(
        'PARTIAL-UPDATE',
      );
    });
  });

  // -----------------------------
  // DELETE - comprehensive scenarios
  // -----------------------------
  describe('Delete Vehicle Document', () => {
    let tempDocumentId: string;

    beforeEach(async () => {
      // Create a temporary document for deletion tests
      const res = await authedRequest(server)
        .post('/api/v1/vehicle-documents')
        .send({
          vehicleId: vehicleIdA,
          documentTypeId: documentTypeIdA,
          documentNo: `TEMP-DELETE-${Date.now()}`,
          startDate: new Date().toISOString(),
          expiryDate: new Date('2026-01-01').toISOString(),
        })
        .expect(201);
      tempDocumentId = (res.body as VehicleDocumentResponse).id;
    });

    it('should delete document successfully', async () => {
      await authedRequest(server)
        .delete(`/api/v1/vehicle-documents/${tempDocumentId}`)
        .expect(200);

      // Verify document is gone
      await authedRequest(server)
        .get(`/api/v1/vehicle-documents/${tempDocumentId}`)
        .expect(404);
    });

    it('deleting already-deleted document should return 404', async () => {
      await authedRequest(server)
        .delete(`/api/v1/vehicle-documents/${tempDocumentId}`)
        .expect(200);

      await authedRequest(server)
        .delete(`/api/v1/vehicle-documents/${tempDocumentId}`)
        .expect(404);
    });

    it('should return 404 when deleting non-existent random id', async () => {
      await authedRequest(server)
        .delete(
          '/api/v1/vehicle-documents/00000000-0000-0000-0000-000000000000',
        )
        .expect(404);
    });
  });

  // -----------------------------
  // EDGE CASES & STRESS
  // -----------------------------
  describe('Edge cases & stress scenarios', () => {
    it('should handle documents with very long notes and links', async () => {
      const longNotes = 'A'.repeat(500); // 500 character notes
      const longLink = `https://example.com/${'doc'.repeat(50)}.pdf`;

      const res = await authedRequest(server)
        .post('/api/v1/vehicle-documents')
        .send({
          vehicleId: vehicleIdA,
          documentTypeId: documentTypeIdA,
          documentNo: `LONG-${Date.now()}`,
          startDate: new Date().toISOString(),
          expiryDate: new Date('2026-01-01').toISOString(),
          notes: longNotes,
          link: longLink,
        })
        .expect(201);

      expect((res.body as VehicleDocumentResponse).notes).toBe(longNotes);
      expect((res.body as VehicleDocumentResponse).link).toBe(longLink);
    });

    it('should handle documents with special characters in documentNo', async () => {
      const res = await authedRequest(server)
        .post('/api/v1/vehicle-documents')
        .send({
          vehicleId: vehicleIdA,
          documentTypeId: documentTypeIdA,
          documentNo: 'DOC/2024/001-ABC_XYZ',
          startDate: new Date().toISOString(),
          expiryDate: new Date('2026-01-01').toISOString(),
        })
        .expect(201);

      expect((res.body as VehicleDocumentResponse).documentNo).toBe(
        'DOC/2024/001-ABC_XYZ',
      );
    });
  });

  // -----------------------------
  // RELATION INTEGRITY TESTS
  // -----------------------------
  describe('Relation integrity tests', () => {
    it('should maintain referential integrity when fetching with relations', async () => {
      const res = await authedRequest(server)
        .get(`/api/v1/vehicle-documents/${vehicleDocA.id}`)
        .expect(200);

      const doc = res.body as VehicleDocumentResponse;

      // Verify vehicle relation
      expect(doc.vehicleId).toBe(vehicleDocA.vehicleId);

      // Verify documentType relation
      expect(doc.documentTypeId).toBe(vehicleDocA.documentTypeId);
    });

    it('should show conflict when deleting vehicle with linked docs', async () => {
      // This test verifies the API behavior when underlying relations change
      // Note: Actual cascade behavior depends on your database schema
      const tempVehicleRes = await authedRequest(server)
        .post('/api/v1/vehicles')
        .send({
          licensePlate: 'TEMP-DELETE',
          rcNumber: 'rc-temp-delete',
          chassisNumber: 'ch-temp-delete',
          engineNumber: 'en-temp-delete',
          categoryId: (
            (await authedRequest(server).get('/api/v1/vehicle-categories'))
              .body as PaginatedCategoryResponseDto
          ).items[0].id,
          typeId: (
            (await authedRequest(server).get('/api/v1/vehicle-types'))
              .body as PaginatedTypeResponseDto
          ).items[0].id,
        })
        .expect(201);

      const tempDocRes = await authedRequest(server)
        .post('/api/v1/vehicle-documents')
        .send({
          vehicleId: (tempVehicleRes.body as VehicleResponse).id,
          documentTypeId: documentTypeIdA,
          documentNo: `TEMP-VEH-${Date.now()}`,
          startDate: new Date().toISOString(),
          expiryDate: new Date('2026-01-01').toISOString(),
        })
        .expect(201);

      // Delete the vehicle
      await authedRequest(server)
        .delete(
          `/api/v1/vehicles/${(tempVehicleRes.body as VehicleResponse).id}`,
        )
        .expect(409);

      // Document will still exist
      const docRes = await authedRequest(server).get(
        `/api/v1/vehicle-documents/${(tempDocRes.body as VehicleResponse).id}`,
      );

      // document should be there, because vehicle is not deleted
      expect([200]).toContain(docRes.status);
    });
  });
});
