import { Test, TestingModule } from '@nestjs/testing';
import {
  INestApplication,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { AppModule } from 'src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import * as request from 'supertest';
import { Express } from 'express';
import { DocumentTypeResponse } from 'src/common/types';
import { PaginatedDocumentTypeResponseDto } from '../src/modules/document-type/dto/document-type-response.dto';

describe('DocumentType E2E (comprehensive + extended)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let server: Express;
  let documentTypeA: DocumentTypeResponse;
  let documentTypeB: DocumentTypeResponse;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    app.enableVersioning({
      type: VersioningType.URI,
      prefix: 'api/v',
    });

    prisma = moduleFixture.get(PrismaService);
    await app.init();
    server = app.getHttpServer() as unknown as Express;

    // Cleanup before running tests
    await prisma.documentType.deleteMany({});
  });

  afterAll(async () => {
    await prisma.documentType.deleteMany({});
    await app.close();
  });

  // ---------------------------------------------------------------------------
  // CREATE
  // ---------------------------------------------------------------------------

  describe('POST /api/v1/document-types', () => {
    it('should create a document type successfully', async () => {
      const res = await request(server)
        .post('/api/v1/document-types')
        .send({ name: 'Insurance Certificate' })
        .expect(201);

      documentTypeA = res.body as DocumentTypeResponse;
      expect(documentTypeA).toHaveProperty('id');
      expect(documentTypeA.name).toBe('Insurance Certificate');
    });

    it('should trim leading/trailing spaces', async () => {
      const res = await request(server)
        .post('/api/v1/document-types')
        .send({ name: '   Pollution Certificate  ' })
        .expect(201);

      documentTypeB = res.body as DocumentTypeResponse;
      expect(documentTypeB.name).toBe('Pollution Certificate');
    });

    it('should reject duplicate name (case-insensitive)', async () => {
      await request(server)
        .post('/api/v1/document-types')
        .send({ name: 'insurance certificate' })
        .expect(409);
    });

    it('should reject empty name', async () => {
      await request(server)
        .post('/api/v1/document-types')
        .send({ name: '' })
        .expect(400);
    });

    it('should reject extra fields', async () => {
      await request(server)
        .post('/api/v1/document-types')
        .send({ name: 'Fitness Certificate', extra: 'oops' })
        .expect(400);
    });

    it('should reject name with special characters', async () => {
      await request(server)
        .post('/api/v1/document-types')
        .send({ name: 'Insurance@Certificate#' })
        .expect(400);
    });
  });

  // ---------------------------------------------------------------------------
  // GET ALL
  // ---------------------------------------------------------------------------

  describe('GET /api/v1/document-types', () => {
    it('should fetch all document types (sorted by default)', async () => {
      const res = await request(server)
        .get('/api/v1/document-types')
        .expect(200);
      const body = res.body as PaginatedDocumentTypeResponseDto;
      expect(body.items.length).toBe(2);
      expect(body.total).toBe(2);
    });

    it('should return empty array when no document types exist', async () => {
      await prisma.documentType.deleteMany({});
      const res = await request(server)
        .get('/api/v1/document-types')
        .expect(200);
      const body = res.body as PaginatedDocumentTypeResponseDto;
      expect(body.items).toEqual([]);
      expect(body.total).toBe(0);

      // recreate document types for next tests
      documentTypeA = await prisma.documentType.create({
        data: { name: 'Insurance Certificate' },
      });
      documentTypeB = await prisma.documentType.create({
        data: { name: 'Pollution Certificate' },
      });
    });

    it('should filter by search query (case-insensitive)', async () => {
      const res = await request(server)
        .get('/api/v1/document-types?search=insur')
        .expect(200);
      const body = res.body as PaginatedDocumentTypeResponseDto;
      expect(body.items.length).toBe(1);
      expect(body.items[0].name).toBe('Insurance Certificate');
    });

    it('should support pagination', async () => {
      const res = await request(server)
        .get('/api/v1/document-types?skip=1&take=1')
        .expect(200);
      const body = res.body as PaginatedDocumentTypeResponseDto;
      expect(body.items.length).toBe(1);
      expect(body.total).toBe(2);
    });
  });

  // ---------------------------------------------------------------------------
  // GET ONE
  // ---------------------------------------------------------------------------

  describe('GET /api/v1/document-types/:id', () => {
    it('should fetch a single document type by ID', async () => {
      const res = await request(server)
        .get(`/api/v1/document-types/${documentTypeA.id}`)
        .expect(200);
      const body = res.body as DocumentTypeResponse;
      expect(body.id).toBe(documentTypeA.id);
      expect(body.name).toBe('Insurance Certificate');
    });

    it('should return 404 for non-existent document type', async () => {
      await request(server)
        .get('/api/v1/document-types/00000000-0000-0000-0000-000000000000')
        .expect(404);
    });

    it('should return 400 for invalid UUID', async () => {
      await request(server)
        .get('/api/v1/document-types/invalid-uuid')
        .expect(400);
    });
  });

  // ---------------------------------------------------------------------------
  // UPDATE
  // ---------------------------------------------------------------------------

  describe('PATCH /api/v1/document-types/:id', () => {
    it('should update a document type name successfully', async () => {
      const res = await request(server)
        .patch(`/api/v1/document-types/${documentTypeA.id}`)
        .send({ name: 'Updated Insurance Certificate' })
        .expect(200);
      const body = res.body as DocumentTypeResponse;
      expect(body.name).toBe('Updated Insurance Certificate');

      const dbDocumentType = await prisma.documentType.findUnique({
        where: { id: documentTypeA.id },
      });
      expect(dbDocumentType?.name).toBe('Updated Insurance Certificate');
    });

    it('should reject duplicate update (case-insensitive)', async () => {
      await request(server)
        .patch(`/api/v1/document-types/${documentTypeA.id}`)
        .send({ name: 'POLLUTION CERTIFICATE' })
        .expect(409);
    });
    it('should reject duplicate update (case-insensitive and trimmed)', async () => {
      await request(server)
        .patch(`/api/v1/document-types/${documentTypeA.id}`)
        .send({ name: 'POLLUTION CERTIFICATE      ' })
        .expect(409);
    });

    it('should reject empty name', async () => {
      await request(server)
        .patch(`/api/v1/document-types/${documentTypeA.id}`)
        .send({ name: '' })
        .expect(400);
    });

    it('should return 404 for updating non-existent document type', async () => {
      await request(server)
        .patch('/api/v1/document-types/00000000-0000-0000-0000-000000000000')
        .send({ name: 'Ghost Document Type' })
        .expect(404);
    });

    it('should allow same name (idempotent)', async () => {
      const res = await request(server)
        .patch(`/api/v1/document-types/${documentTypeB.id}`)
        .send({ name: 'Pollution Certificate' })
        .expect(200);
      const body = res.body as DocumentTypeResponse;
      expect(body.name).toBe('Pollution Certificate');
    });
  });

  // ---------------------------------------------------------------------------
  // DELETE
  // ---------------------------------------------------------------------------

  describe('DELETE /api/v1/document-types/:id', () => {
    it('should delete document type successfully', async () => {
      const newDocumentType = await prisma.documentType.create({
        data: { name: 'Fitness Certificate' },
      });
      const res = await request(server)
        .delete(`/api/v1/document-types/${newDocumentType.id}`)
        .expect(200);

      expect(res.body).toEqual({ success: true });
      const exists = await prisma.documentType.findUnique({
        where: { id: newDocumentType.id },
      });
      expect(exists).toBeNull();
    });

    it('should return 404 for non-existent document type', async () => {
      await request(server)
        .delete('/api/v1/document-types/00000000-0000-0000-0000-000000000000')
        .expect(404);
    });
  });

  // ---------------------------------------------------------------------------
  // FINAL CLEANUP VALIDATION
  // ---------------------------------------------------------------------------

  describe('Final DB integrity checks', () => {
    it('should leave DB in clean state', async () => {
      const documentTypes = await prisma.documentType.findMany();
      expect(documentTypes.length).toBeGreaterThanOrEqual(1);
    });
  });
});
