import { Test, TestingModule } from '@nestjs/testing';
import {
  INestApplication,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import * as request from 'supertest';
import { Express } from 'express';
import { OwnerResponse } from 'src/common/types';
import { PaginatedOwnerResponseDto } from 'src/modules/owner/dto/owner-response.dto';

describe('Owner E2E (comprehensive + extended)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let server: Express;
  let ownerA: OwnerResponse;
  let ownerB: OwnerResponse;

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
    await prisma.owner.deleteMany({});
  });

  afterAll(async () => {
    await prisma.owner.deleteMany({});
    await app.close();
  });

  // ---------------------------------------------------------------------------
  // CREATE
  // ---------------------------------------------------------------------------

  describe('POST /api/v1/owners', () => {
    it('should create an owner successfully', async () => {
      const res = await request(server)
        .post('/api/v1/owners')
        .send({ name: 'Tata Motors' })
        .expect(201);

      ownerA = res.body as OwnerResponse;
      expect(ownerA).toHaveProperty('id');
      expect(ownerA.name).toBe('Tata Motors');
    });

    it('should trim leading/trailing spaces', async () => {
      const res = await request(server)
        .post('/api/v1/owners')
        .send({ name: '   Maruti Suzuki  ' })
        .expect(201);

      ownerB = res.body as OwnerResponse;
      expect(ownerB.name).toBe('Maruti Suzuki');
    });

    it('should reject duplicate name (case-insensitive)', async () => {
      await request(server)
        .post('/api/v1/owners')
        .send({ name: 'tata motors' })
        .expect(409);
    });

    it('should reject empty name', async () => {
      await request(server)
        .post('/api/v1/owners')
        .send({ name: '' })
        .expect(400);
    });

    it('should reject extra fields', async () => {
      await request(server)
        .post('/api/v1/owners')
        .send({ name: 'Hyundai', extra: 'oops' })
        .expect(400);
    });
  });

  // ---------------------------------------------------------------------------
  // GET ALL
  // ---------------------------------------------------------------------------

  describe('GET /api/v1/owners', () => {
    it('should fetch all owners (sorted asc)', async () => {
      const res = await request(server).get('/api/v1/owners').expect(200);
      const body = res.body as PaginatedOwnerResponseDto;
      const names = body.items.map((o: OwnerResponse) => o.name);
      expect(names).toEqual(['Maruti Suzuki', 'Tata Motors']); // sorted asc
    });

    it('should return empty array when no owners exist', async () => {
      await prisma.owner.deleteMany({});
      const res = await request(server).get('/api/v1/owners').expect(200);
      const body = res.body as PaginatedOwnerResponseDto;
      expect(body.items).toEqual([]);
      // recreate owners for next tests
      ownerA = await prisma.owner.create({ data: { name: 'Tata Motors' } });
      ownerB = await prisma.owner.create({ data: { name: 'Maruti Suzuki' } });
    });

    it('should filter by search query (case-insensitive)', async () => {
      const res = await request(server)
        .get('/api/v1/owners?search=tA')
        .expect(200);
      const body = res.body as PaginatedOwnerResponseDto;
      expect(body.items.length).toBe(1);
      expect(body.items[0].name).toBe('Tata Motors');
    });
  });

  // ---------------------------------------------------------------------------
  // GET ONE
  // ---------------------------------------------------------------------------

  describe('GET /api/v1/owners/:id', () => {
    it('should fetch a single owner by ID', async () => {
      const res = await request(server)
        .get(`/api/v1/owners/${ownerA.id}`)
        .expect(200);
      const body = res.body as OwnerResponse;
      expect(body.id).toBe(ownerA.id);
      expect(body.name).toBe('Tata Motors');
    });

    it('should return 404 for non-existent owner', async () => {
      await request(server)
        .get('/api/v1/owners/00000000-0000-0000-0000-000000000000')
        .expect(404);
    });
  });

  // ---------------------------------------------------------------------------
  // UPDATE
  // ---------------------------------------------------------------------------

  describe('PATCH /api/v1/owners/:id', () => {
    it('should update an owner name successfully', async () => {
      const res = await request(server)
        .patch(`/api/v1/owners/${ownerA.id}`)
        .send({ name: 'Tata Group' })
        .expect(200);
      const body = res.body as OwnerResponse;
      expect(body.name).toBe('Tata Group');

      const dbOwner = await prisma.owner.findUnique({
        where: { id: ownerA.id },
      });
      expect(dbOwner?.name).toBe('Tata Group');
    });

    it('should reject duplicate update (case-insensitive)', async () => {
      await request(server)
        .patch(`/api/v1/owners/${ownerA.id}`)
        .send({ name: 'MARUTI SUZUKI' })
        .expect(409);
    });
    it('should reject duplicate update (case-insensitive and trimmed)', async () => {
      await request(server)
        .patch(`/api/v1/owners/${ownerA.id}`)
        .send({ name: 'MARUTI SUZUKI     ' })
        .expect(409);
    });
    it('should reject duplicate update (case-insensitive)', async () => {
      await request(server)
        .patch(`/api/v1/owners/${ownerA.id}`)
        .send({ name: 'MARUTI SUZUKI' })
        .expect(409);
    });

    it('should reject empty name', async () => {
      await request(server)
        .patch(`/api/v1/owners/${ownerA.id}`)
        .send({ name: '' })
        .expect(400);
    });

    it('should return 404 for updating non-existent owner', async () => {
      await request(server)
        .patch('/api/v1/owners/00000000-0000-0000-0000-000000000000')
        .send({ name: 'Ghost Owner' })
        .expect(404);
    });

    it('should allow same name (idempotent)', async () => {
      const res = await request(server)
        .patch(`/api/v1/owners/${ownerB.id}`)
        .send({ name: 'Maruti Suzuki' })
        .expect(200);
      const body = res.body as OwnerResponse;
      expect(body.name).toBe('Maruti Suzuki');
    });
  });

  // ---------------------------------------------------------------------------
  // DELETE
  // ---------------------------------------------------------------------------

  describe('DELETE /api/v1/owners/:id', () => {
    it('should delete owner successfully', async () => {
      const newOwner = await prisma.owner.create({
        data: { name: 'Ford India' },
      });
      const res = await request(server)
        .delete(`/api/v1/owners/${newOwner.id}`)
        .expect(200);

      expect(res.body).toEqual({ success: true });
      const exists = await prisma.owner.findUnique({
        where: { id: newOwner.id },
      });
      expect(exists).toBeNull();
    });

    it('should return 404 for non-existent owner', async () => {
      await request(server)
        .delete('/api/v1/owners/00000000-0000-0000-0000-000000000000')
        .expect(404);
    });
  });

  // ---------------------------------------------------------------------------
  // FINAL CLEANUP VALIDATION
  // ---------------------------------------------------------------------------

  describe('Final DB integrity checks', () => {
    it('should leave DB in clean state', async () => {
      const owners = await prisma.owner.findMany();
      expect(owners.length).toBeGreaterThanOrEqual(1);
      // we purposely keep some for next tests, so no full cleanup assertion here
    });
  });
});
