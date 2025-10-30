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
import { VehicleTypeResponse } from 'src/common/types';
import { PaginatedTypeResponseDto } from 'src/modules/vehicle-type/dto/vehicle-type-response.dto';

describe('VehicleType E2E (comprehensive + extended)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let server: Express;
  let sedanCategoryId: string;
  let suvCategoryId: string;
  let sedanTypeId: string;

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

    // Cleanup and setup
    await prisma.vehicleType.deleteMany({});
    await prisma.vehicleCategory.deleteMany({});

    const sedan = await prisma.vehicleCategory.create({
      data: { name: 'Sedan' },
    });
    const suv = await prisma.vehicleCategory.create({ data: { name: 'SUV' } });
    sedanCategoryId = sedan.id;
    suvCategoryId = suv.id;
  });

  afterAll(async () => {
    await prisma.vehicleType.deleteMany({});
    await prisma.vehicleCategory.deleteMany({});
    await app.close();
  });

  // -------------------
  // CREATE TESTS
  // -------------------
  describe('POST /api/v1/vehicle-types', () => {
    it('should create a new vehicle type under a valid category', async () => {
      const res = await request(server)
        .post('/api/v1/vehicle-types')
        .send({ name: 'Compact', categoryId: sedanCategoryId })
        .expect(201);

      const body = res.body as VehicleTypeResponse;
      expect(body.id).toBeDefined();
      expect(body.name).toBe('Compact');
      expect(body.categoryId).toBe(sedanCategoryId);
      sedanTypeId = body.id;
    });

    it('should throw 400 if name is missing', async () => {
      await request(server)
        .post('/api/v1/vehicle-types')
        .send({ categoryId: sedanCategoryId })
        .expect(400);
    });

    it('should throw 400 if categoryId is missing', async () => {
      await request(server)
        .post('/api/v1/vehicle-types')
        .send({ name: 'Luxury' })
        .expect(400);
    });

    it('should throw 404 if categoryId does not exist', async () => {
      await request(server)
        .post('/api/v1/vehicle-types')
        .send({
          name: 'Sports',
          categoryId: '1657cb04-615c-48b7-8cdd-5113398c9936',
        })
        .expect(404);
    });

    it('should throw 409 if type already exists (case insensitive)', async () => {
      await request(server)
        .post('/api/v1/vehicle-types')
        .send({ name: 'compact', categoryId: sedanCategoryId })
        .expect(409);
    });

    it('should allow same type name under different category', async () => {
      const res = await request(server)
        .post('/api/v1/vehicle-types')
        .send({ name: 'Compact', categoryId: suvCategoryId })
        .expect(201);
      const body = res.body as VehicleTypeResponse;
      expect(body.categoryId).toBe(suvCategoryId);
    });

    it('should reject special characters in name', async () => {
      await request(server)
        .post('/api/v1/vehicle-types')
        .send({ name: 'Luxury@2025', categoryId: sedanCategoryId })
        .expect(400);
    });
  });

  // -------------------
  // FIND ALL
  // -------------------
  describe('GET /api/v1/vehicle-types', () => {
    beforeAll(async () => {
      await prisma.vehicleType.createMany({
        data: [
          { name: 'Deluxe', categoryId: sedanCategoryId },
          { name: 'Basic', categoryId: sedanCategoryId },
          { name: 'Crossover', categoryId: suvCategoryId },
        ],
      });
    });

    it('should list all vehicle types', async () => {
      const res = await request(server)
        .get('/api/v1/vehicle-types')
        .expect(200);
      const body = res.body as PaginatedTypeResponseDto;
      expect(Array.isArray(body.items)).toBe(true);
      expect(body.items.length).toBeGreaterThanOrEqual(4);
    });

    it('should filter by categoryId', async () => {
      const res = await request(server)
        .get(`/api/v1/vehicle-types?filters={"categoryId":"${suvCategoryId}"}`)
        .expect(200);
      const body = res.body as PaginatedTypeResponseDto;
      body.items.forEach((t: VehicleTypeResponse) =>
        expect(t.categoryId).toBe(suvCategoryId),
      );
    });

    it('should filter by search (case-insensitive contains)', async () => {
      const res = await request(server)
        .get('/api/v1/vehicle-types?search=del')
        .expect(200);
      const body = res.body as PaginatedTypeResponseDto;
      expect(
        body.items.some((t: VehicleTypeResponse) => t.name === 'Deluxe'),
      ).toBe(true);
    });

    it('should return empty list if no match', async () => {
      const res = await request(server)
        .get('/api/v1/vehicle-types?search=nonexistent')
        .expect(200);
      const body = res.body as PaginatedTypeResponseDto;
      expect(body.items).toEqual([]);
    });
  });

  // -------------------
  // FIND ONE
  // -------------------
  describe('GET /api/v1/vehicle-types/:id', () => {
    it('should get vehicle type by id', async () => {
      const res = await request(server)
        .get(`/api/v1/vehicle-types/${sedanTypeId}`)
        .expect(200);
      const body = res.body as VehicleTypeResponse;
      expect(body.name).toBe('Compact');
    });

    it('should return 404 for non-existent id', async () => {
      await request(server)
        .get('/api/v1/vehicle-types/00000000-0000-0000-0000-000000000000')
        .expect(404);
    });

    it('should return 400 for invalid UUID', async () => {
      await request(server).get('/api/v1/vehicle-types/invalid-id').expect(400);
    });
  });

  // -------------------
  // UPDATE
  // -------------------
  describe('PATCH /api/v1/vehicle-types/:id', () => {
    it('should rename the vehicle type', async () => {
      const res = await request(server)
        .patch(`/api/v1/vehicle-types/${sedanTypeId}`)
        .send({ name: 'CompactPlus' })
        .expect(200);
      const body = res.body as VehicleTypeResponse;
      expect(body.name).toBe('CompactPlus');
    });

    it('should reassign a vehicle type to another category', async () => {
      const res = await request(server)
        .patch(`/api/v1/vehicle-types/${sedanTypeId}`)
        .send({ categoryId: suvCategoryId })
        .expect(200);
      const body = res.body as VehicleTypeResponse;
      expect(body.categoryId).toBe(suvCategoryId);
    });

    it('should throw 409 if reassigning to category where same name exists', async () => {
      const deluxe = await prisma.vehicleType.create({
        data: { name: 'Luxury', categoryId: sedanCategoryId },
      });

      await prisma.vehicleType.create({
        data: { name: 'Luxury', categoryId: suvCategoryId },
      });

      await request(server)
        .patch(`/api/v1/vehicle-types/${deluxe.id}`)
        .send({ categoryId: suvCategoryId })
        .expect(409);
    });

    it('should throw 404 if updating non-existent type', async () => {
      await request(server)
        .patch('/api/v1/vehicle-types/00000000-0000-0000-0000-000000000000')
        .send({ name: 'Phantom' })
        .expect(404);
    });

    it('should reject empty name', async () => {
      await request(server)
        .patch(`/api/v1/vehicle-types/${sedanTypeId}`)
        .send({ name: '' })
        .expect(400);
    });
  });

  // -------------------
  // DELETE
  // -------------------
  describe('DELETE /api/v1/vehicle-types/:id', () => {
    it('should delete vehicle type', async () => {
      const toDelete = await prisma.vehicleType.create({
        data: { name: 'Temporary', categoryId: sedanCategoryId },
      });

      const res = await request(server)
        .delete(`/api/v1/vehicle-types/${toDelete.id}`)
        .expect(200);
      const body = res.body as { success: boolean };
      expect(body.success).toBe(true);

      const check = await prisma.vehicleType.findUnique({
        where: { id: toDelete.id },
      });
      expect(check).toBeNull();
    });

    it('should return 404 when deleting non-existent type', async () => {
      await request(server)
        .delete('/api/v1/vehicle-types/00000000-0000-0000-0000-000000000000')
        .expect(404);
    });
  });
});
