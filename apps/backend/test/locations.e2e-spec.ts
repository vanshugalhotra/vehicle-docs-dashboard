import { INestApplication } from '@nestjs/common';
import { PrismaService } from '../src/prisma/prisma.service';
import { Express } from 'express';
import { LocationResponse } from 'src/common/types';
import { PaginatedLocationResponseDto } from 'src/modules/location/dto/location-response';
import { setupTestAuth, authedRequest } from './utils/e2e-setup/auth-test';
import { createTestApp } from './utils/e2e-setup/app-setup';

describe('Location E2E (comprehensive + extended)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let server: Express;
  let locA: LocationResponse;

  beforeAll(async () => {
    app = await createTestApp();
    prisma = app.get(PrismaService);
    server = app.getHttpServer() as unknown as Express;
    await setupTestAuth(server);

    // Ensure clean DB
    await prisma.vehicle.deleteMany({});
    await prisma.location.deleteMany({});

    // seed two locations
    locA = await prisma.location.create({
      data: { name: 'Central Warehouse' },
    });
    await prisma.location.create({ data: { name: 'North Dock' } });
  });

  afterAll(async () => {
    await prisma.vehicle.deleteMany({});
    await prisma.location.deleteMany({});
    await app.close();
  });

  describe('Create Location', () => {
    it('should create a location', async () => {
      const res = await authedRequest(server)
        .post('/api/v1/locations')
        .send({ name: 'East Yard' })
        .expect(201);

      const body = res.body as LocationResponse;
      expect(body.id).toBeDefined();
      expect(body.name).toBe('East Yard');
    });

    it('should return 400 when name is missing', async () => {
      await authedRequest(server)
        .post('/api/v1/locations')
        .send({})
        .expect(400);
    });

    it('should return 409 on duplicate name (case-insensitive)', async () => {
      // Central Warehouse exists; try lowercased or different casing
      await authedRequest(server)
        .post('/api/v1/locations')
        .send({ name: 'central warehouse' })
        .expect(409);
    });

    it('should reject names with invalid characters', async () => {
      await authedRequest(server)
        .post('/api/v1/locations')
        .send({ name: 'Bad@Name!' })
        .expect(400);
    });
  });

  describe('Fetch Location', () => {
    it('should fetch all locations', async () => {
      const res = await authedRequest(server)
        .get('/api/v1/locations')
        .expect(200);
      const list = res.body as PaginatedLocationResponseDto;
      expect(list.items.length).toBeGreaterThanOrEqual(2);
    });

    it('should search locations (case-insensitive contains)', async () => {
      const res = await authedRequest(server)
        .get('/api/v1/locations?search=central')
        .expect(200);
      const list = res.body as PaginatedLocationResponseDto;
      expect(list.items.length).toBe(1);
      expect(list.items[0].name).toBe('Central Warehouse');
    });

    it('should fetch single location by ID', async () => {
      const res = await authedRequest(server)
        .get(`/api/v1/locations/${locA.id}`)
        .expect(200);
      const single = res.body as LocationResponse;
      expect(single.name).toBe('Central Warehouse');
    });

    it('should return 404 for non-existent location', async () => {
      await authedRequest(server)
        .get('/api/v1/locations/00000000-0000-0000-0000-000000000000')
        .expect(404);
    });

    it('should return 400 for invalid UUID', async () => {
      await authedRequest(server)
        .get('/api/v1/locations/invalid-uuid')
        .expect(400);
    });
  });

  describe('Update Location', () => {
    let createdId: string;

    beforeAll(async () => {
      const loc = await prisma.location.create({
        data: { name: 'Temp Update' },
      });
      createdId = loc.id;
    });

    it('should update name successfully', async () => {
      const res = await authedRequest(server)
        .patch(`/api/v1/locations/${createdId}`)
        .send({ name: 'Updated Name' })
        .expect(200);

      const updated = res.body as LocationResponse;
      expect(updated.name).toBe('Updated Name');
    });

    it('should return 409 when updating to a duplicate name', async () => {
      await authedRequest(server)
        .patch(`/api/v1/locations/${createdId}`)
        .send({ name: 'North Dock' })
        .expect(409);
    });
    it('should return 409 when updating to a duplicate name (trim)', async () => {
      await authedRequest(server)
        .patch(`/api/v1/locations/${createdId}`)
        .send({ name: 'North Dock    ' })
        .expect(409);
    });

    it('should return 404 when updating non-existent location', async () => {
      await authedRequest(server)
        .patch('/api/v1/locations/00000000-0000-0000-0000-000000000000')
        .send({ name: 'DoesNotExist' })
        .expect(404);
    });
  });

  describe('Delete Location', () => {
    it('should delete a location without linked vehicles', async () => {
      const loc = await prisma.location.create({ data: { name: 'ToDelete' } });
      await authedRequest(server)
        .delete(`/api/v1/locations/${loc.id}`)
        .expect(200);
      const found = await prisma.location.findUnique({ where: { id: loc.id } });
      expect(found).toBeNull();
    });

    it('should return 404 when deleting a non-existent location', async () => {
      await authedRequest(server)
        .delete('/api/v1/locations/00000000-0000-0000-0000-000000000000')
        .expect(404);
    });
  });
});
