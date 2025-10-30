import { Test, TestingModule } from '@nestjs/testing';
import {
  INestApplication,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import * as request from 'supertest';
import { Express } from 'express';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { DriverResponse } from 'src/common/types';
import { PaginatedDriverResponseDto } from 'src/modules/driver/dto/driver-response.dto';

describe('Driver E2E (Comprehensive & Production-grade)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let server: Express;
  let driverA: DriverResponse;
  let driverB: DriverResponse;

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

    // Clean database before test run
    await prisma.vehicle.deleteMany({});
    await prisma.driver.deleteMany({});
  });

  afterAll(async () => {
    await prisma.vehicle.deleteMany({});
    await prisma.driver.deleteMany({});
    await app.close();
  });

  // ────────────────────────────────────────────────
  // CREATE
  // ────────────────────────────────────────────────
  describe('POST /api/v1/drivers', () => {
    it('should create a driver successfully', async () => {
      const res = await request(server)
        .post('/api/v1/drivers')
        .send({
          name: 'John Doe',
          phone: '9999999999',
          email: 'john@example.com',
        })
        .expect(201);

      driverA = res.body as DriverResponse;
      expect(driverA).toHaveProperty('id');
      expect(driverA.name).toBe('John Doe');
      expect(driverA.phone).toBe('9999999999');
      expect(driverA.email).toBe('john@example.com');
    });

    it('should create another driver without email', async () => {
      const res = await request(server)
        .post('/api/v1/drivers')
        .send({
          name: 'No Email Driver',
          phone: '8888888888',
        })
        .expect(201);

      driverB = res.body as DriverResponse;
      expect(driverB.email).toBeNull();
    });

    it('should reject duplicate phone numbers', async () => {
      await request(server)
        .post('/api/v1/drivers')
        .send({
          name: 'Dup Phone',
          phone: '9999999999',
          email: 'new@example.com',
        })
        .expect(409);
    });

    it('should reject duplicate email', async () => {
      await request(server)
        .post('/api/v1/drivers')
        .send({
          name: 'Dup Email',
          phone: '7777777777',
          email: 'john@example.com',
        })
        .expect(409);
    });

    it('should reject invalid payload (missing name)', async () => {
      await request(server)
        .post('/api/v1/drivers')
        .send({ phone: '1234567890' })
        .expect(400);
    });

    it('should reject invalid phone format', async () => {
      await request(server)
        .post('/api/v1/drivers')
        .send({ name: 'BadPhone', phone: 'abc' })
        .expect(400);
    });
  });

  // ────────────────────────────────────────────────
  // FIND ALL
  // ────────────────────────────────────────────────
  describe('GET /api/v1/drivers', () => {
    it('should fetch all drivers ordered by name', async () => {
      const res = await request(server).get('/api/v1/drivers').expect(200);
      const body = res.body as PaginatedDriverResponseDto;
      expect(Array.isArray(body['items'])).toBe(true);
      expect(body['items'].length).toBeGreaterThanOrEqual(2);
      expect(body['items'][0]).toHaveProperty('name');
    });

    it('should support search by name', async () => {
      const res = await request(server)
        .get('/api/v1/drivers')
        .query({ search: 'john' })
        .expect(200);
      const body = res.body as PaginatedDriverResponseDto;
      expect(body['items'].length).toBe(1);
      expect(body['items'][0].name).toContain('John');
    });

    it('should support search by phone', async () => {
      const res = await request(server)
        .get('/api/v1/drivers')
        .query({ search: '8888' })
        .expect(200);
      const body = res.body as PaginatedDriverResponseDto;
      expect(body['items'].length).toBe(1);
      expect(body['items'][0].phone).toContain('8888');
    });
  });

  // ────────────────────────────────────────────────
  // FIND ONE
  // ────────────────────────────────────────────────
  describe('GET /api/v1/drivers/:id', () => {
    it('should fetch a single driver by id', async () => {
      const res = await request(server)
        .get(`/api/v1/drivers/${driverA.id}`)
        .expect(200);
      const body = res.body as DriverResponse;
      expect(body.name).toBe('John Doe');
    });

    it('should return 404 for non-existent driver', async () => {
      await request(server)
        .get('/api/v1/drivers/00000000-0000-0000-0000-000000000000')
        .expect(404);
    });
  });

  // ────────────────────────────────────────────────
  // UPDATE
  // ────────────────────────────────────────────────
  describe('PATCH /api/v1/drivers/:id', () => {
    it('should update driver successfully', async () => {
      const res = await request(server)
        .patch(`/api/v1/drivers/${driverA.id}`)
        .send({ name: 'John Updated', email: 'john.updated@example.com' })
        .expect(200);
      const body = res.body as DriverResponse;
      expect(body.name).toBe('John Updated');
      expect(body.email).toBe('john.updated@example.com');
    });

    it('should reject updates to existing phone', async () => {
      await request(server)
        .patch(`/api/v1/drivers/${driverA.id}`)
        .send({ phone: '8888888888' }) // phone of driverB
        .expect(409);
    });
    it('should reject due to duplicate after trim', async () => {
      await request(server)
        .patch(`/api/v1/drivers/${driverA.id}`)
        .send({ phone: '8888888888    ' })
        .expect(409);
    });

    it('should accept updates to existing email', async () => {
      await request(server)
        .patch(`/api/v1/drivers/${driverA.id}`)
        .send({ email: driverB.email ?? 'john@example.com' })
        .expect(200);
    });

    it('should return 404 when updating non-existent driver', async () => {
      await request(server)
        .patch('/api/v1/drivers/00000000-0000-0000-0000-000000000000')
        .send({ name: 'Ghost' })
        .expect(404);
    });
  });

  // ────────────────────────────────────────────────
  // DELETE
  // ────────────────────────────────────────────────
  describe('DELETE /api/v1/drivers/:id', () => {
    it('should delete driver successfully', async () => {
      const res = await request(server)
        .delete(`/api/v1/drivers/${driverB.id}`)
        .expect(200);
      const body = res.body as { success: boolean };
      expect(body.success).toBe(true);

      const exists = await prisma.driver.findUnique({
        where: { id: driverB.id },
      });
      expect(exists).toBeNull();
    });

    it('should return 404 when deleting non-existent driver', async () => {
      await request(server)
        .delete('/api/v1/drivers/00000000-0000-0000-0000-000000000000')
        .expect(404);
    });
  });
});
