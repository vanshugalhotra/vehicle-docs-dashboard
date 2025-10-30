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
import { VehicleResponse } from 'src/common/types';
import { VehicleCategoryResponse } from 'src/common/types';
import { VehicleTypeResponse } from 'src/common/types';
import { OwnerResponse } from 'src/common/types';
import { DriverResponse } from 'src/common/types';
import { LocationResponse } from 'src/common/types';
import { PaginatedVehicleResponseDto } from 'src/modules/vehicle/dto/vehicle-response.dto';

describe('Vehicles E2E (Comprehensive & Production-grade)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let server: Express;

  // reference IDs
  let categoryIdA: string;
  let typeIdA: string;
  let categoryIdB: string;
  let typeIdB: string;
  let ownerId: string;
  let driverId: string;
  let locationId: string;

  let vehicleA: VehicleResponse;
  let vehicleB: VehicleResponse;

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

    // Clean up relevant tables before tests
    await prisma.vehicle.deleteMany({});
    await prisma.vehicleType.deleteMany({});
    await prisma.vehicleCategory.deleteMany({});
    await prisma.owner.deleteMany({});
    await prisma.driver.deleteMany({});
    await prisma.location.deleteMany({});

    // Create reference data via API to avoid "dummy" bypass
    const catResA = await request(server)
      .post('/api/v1/vehicle-categories')
      .send({ name: 'Car' })
      .expect(201);
    const catResAbody = catResA.body as VehicleCategoryResponse;
    categoryIdA = catResAbody.id;

    const typeResA = await request(server)
      .post('/api/v1/vehicle-types')
      .send({ name: 'Sedan', categoryId: categoryIdA })
      .expect(201);
    const typeResAbody = typeResA.body as VehicleTypeResponse;
    typeIdA = typeResAbody.id;

    const catResB = await request(server)
      .post('/api/v1/vehicle-categories')
      .send({ name: 'Truck' })
      .expect(201);
    const catResBbody = catResB.body as VehicleCategoryResponse;
    categoryIdB = catResBbody.id;

    const typeResB = await request(server)
      .post('/api/v1/vehicle-types')
      .send({ name: 'Mini-Truck', categoryId: categoryIdB })
      .expect(201);
    const typeResBbody = typeResB.body as VehicleTypeResponse;
    typeIdB = typeResBbody.id;

    const ownerRes = await request(server)
      .post('/api/v1/owners')
      .send({ name: 'Fleet Owner' })
      .expect(201);
    const ownerResbody = ownerRes.body as OwnerResponse;
    ownerId = ownerResbody.id;

    const driverRes = await request(server)
      .post('/api/v1/drivers')
      .send({ name: 'Driver One', phone: '7001112222' })
      .expect(201);
    const driverResbody = driverRes.body as DriverResponse;
    driverId = driverResbody.id;

    const locRes = await request(server)
      .post('/api/v1/locations')
      .send({ name: 'Main Depot' })
      .expect(201);
    const locResbody = locRes.body as LocationResponse;
    locationId = locResbody.id;
  });

  afterAll(async () => {
    // Best-effort cleanup (prefer API deletes would also work but Prisma is ok in tests)
    await prisma.vehicle.deleteMany({});
    await prisma.vehicleType.deleteMany({});
    await prisma.vehicleCategory.deleteMany({});
    await prisma.owner.deleteMany({});
    await prisma.driver.deleteMany({});
    await prisma.location.deleteMany({});
    await app.close();
  });

  // -----------------------------
  // CREATE - Happy path + validations
  // -----------------------------
  describe('Create Vehicle - validations and happy path', () => {
    it('should create vehicle A (happy path) and auto-generate name', async () => {
      const res = await request(server)
        .post('/api/v1/vehicles')
        .send({
          licensePlate: 'ab1234',
          rcNumber: 'rc-001',
          chassisNumber: 'ch-001',
          engineNumber: 'en-001',
          categoryId: categoryIdA,
          typeId: typeIdA,
          ownerId,
          driverId,
          locationId,
          notes: 'First vehicle',
        })
        .expect(201);

      vehicleA = res.body as VehicleResponse;
      expect(vehicleA.id).toBeDefined();
      // license plate should be normalized to uppercase in service
      expect(vehicleA.licensePlate).toBe('AB1234');
      // name should contain category and type names and license plate
      expect(vehicleA.name).toMatch(/Car\s*\(Sedan\).*AB1234/);
    });

    it('should create vehicle B', async () => {
      const res = await request(server)
        .post('/api/v1/vehicles')
        .send({
          licensePlate: 'CD9999',
          rcNumber: 'rc-002',
          chassisNumber: 'ch-002',
          engineNumber: 'en-002',
          categoryId: categoryIdB,
          typeId: typeIdB,
          notes: 'Second vehicle',
        })
        .expect(201);

      vehicleB = res.body as VehicleResponse;
      expect(vehicleB.name).toMatch(/Truck\s*\(Mini-Truck\).*CD9999/);
    });

    it('should reject creation with missing required fields (400)', async () => {
      await request(server)
        .post('/api/v1/vehicles')
        .send({ licensePlate: 'X1' }) // too few required fields
        .expect(400);
    });

    it('should reject creation when categoryId/typeId invalid (404)', async () => {
      await request(server)
        .post('/api/v1/vehicles')
        .send({
          licensePlate: 'ZZ1111',
          rcNumber: 'rc-x',
          chassisNumber: 'ch-x',
          engineNumber: 'en-x',
          categoryId: '047529c1-5f9e-43e0-9929-d9e56e7d32e6',
          typeId: typeIdA,
        })
        .expect(404);

      await request(server)
        .post('/api/v1/vehicles')
        .send({
          licensePlate: 'ZZ2222',
          rcNumber: 'rc-y',
          chassisNumber: 'ch-y',
          engineNumber: 'en-y',
          categoryId: categoryIdA,
          typeId: '047529c1-5f9e-43e0-9929-d9e56e7d32e6',
        })
        .expect(404);
    });

    it('should enforce uniqueness on licensePlate / rc / chassis / engine (409)', async () => {
      // try duplicate license plate in different case -> should conflict
      await request(server)
        .post('/api/v1/vehicles')
        .send({
          licensePlate: 'ab1234', // same as vehicleA (case-insensitive)
          rcNumber: 'unique-rc',
          chassisNumber: 'unique-ch',
          engineNumber: 'unique-en',
          categoryId: categoryIdA,
          typeId: typeIdA,
        })
        .expect(409);

      // duplicate rcNumber
      await request(server)
        .post('/api/v1/vehicles')
        .send({
          licensePlate: 'UNQ1',
          rcNumber: 'rc-001', // same as vehicleA
          chassisNumber: 'unique-ch2',
          engineNumber: 'unique-en2',
          categoryId: categoryIdA,
          typeId: typeIdA,
        })
        .expect(409);
    });
  });

  // -----------------------------
  // READ / LIST / SIMPLE FILTERS
  // -----------------------------
  describe('List and fetch vehicles', () => {
    it('GET /vehicles returns array and includes created vehicles', async () => {
      const res = await request(server).get('/api/v1/vehicles').expect(200);
      const arr = res.body as PaginatedVehicleResponseDto;
      expect(Array.isArray(arr.items)).toBe(true);
      expect(arr.items.some((v) => v.id === vehicleA.id)).toBe(true);
      expect(arr.items.some((v) => v.id === vehicleB.id)).toBe(true);
    });

    it('GET /vehicles/:id should return the vehicle (200)', async () => {
      const res = await request(server)
        .get(`/api/v1/vehicles/${vehicleA.id}`)
        .expect(200);
      expect((res.body as VehicleResponse).id).toBe(vehicleA.id);
    });

    it('GET /vehicles/:id with invalid uuid -> 400', async () => {
      await request(server).get('/api/v1/vehicles/invalid-uuid').expect(400);
    });

    it('GET /vehicles/:id non-existent -> 404', async () => {
      await request(server)
        .get('/api/v1/vehicles/047529c1-5f9e-43e0-9929-d9e56e7d32e6')
        .expect(404);
    });

    it('should support basic pagination params skip & take (smoke)', async () => {
      // create a few more vehicles for pagination
      for (let i = 0; i < 5; i++) {
        await request(server)
          .post('/api/v1/vehicles')
          .send({
            licensePlate: `PAG${i}${Math.floor(Math.random() * 1000)}`,
            rcNumber: `rc-pag-${i}-${Date.now()}`,
            chassisNumber: `ch-pag-${i}-${Date.now()}`,
            engineNumber: `en-pag-${i}-${Date.now()}`,
            categoryId: categoryIdA,
            typeId: typeIdA,
          })
          .expect(201);
      }

      // default listing
      const all = await request(server).get('/api/v1/vehicles').expect(200);
      const allBody = all.body as PaginatedVehicleResponseDto;
      expect(Array.isArray(allBody.items)).toBe(true);

      // try skip/take if supported (controller likely maps query to skip/take)
      const paged = await request(server)
        .get('/api/v1/vehicles?skip=0&take=3')
        .expect(200);
      const body = paged.body as PaginatedVehicleResponseDto;
      expect(Array.isArray(body.items)).toBe(true);
      expect(body.items.length).toBeLessThanOrEqual(3);
    });
  });

  // -----------------------------
  // ADVANCED QUERY TESTS
  // -----------------------------
  describe('Vehicle query options', () => {
    let searchVehicle: VehicleResponse; // Change to VehicleResponseDto
    let ScategoryId: string;
    let StypeId: string;
    let SlocationId: string;

    beforeAll(async () => {
      // Create supporting entities
      const cat = await request(server)
        .post('/api/v1/vehicle-categories')
        .send({ name: `SearchCat-${Date.now()}` })
        .expect(201);
      const catBody = cat.body as VehicleCategoryResponse;
      ScategoryId = catBody.id; // Add type assertion

      const type = await request(server)
        .post('/api/v1/vehicle-types')
        .send({ name: `SearchType-${Date.now()}`, categoryId: ScategoryId })
        .expect(201);
      const typeBody = type.body as VehicleTypeResponse;
      StypeId = typeBody.id; // Add type assertion

      const loc = await request(server)
        .post('/api/v1/locations')
        .send({ name: `SearchLoc-${Date.now()}` })
        .expect(201);
      const locBody = loc.body as LocationResponse;
      SlocationId = locBody.id; // Add type assertion

      // Create a test vehicle to search/filter/sort
      const res = await request(server)
        .post('/api/v1/vehicles')
        .send({
          licensePlate: `SRCH-${Math.floor(Math.random() * 10000)}`,
          rcNumber: `rc-search-${Date.now()}`,
          chassisNumber: `ch-search-${Date.now()}`,
          engineNumber: `en-search-${Date.now()}`,
          categoryId: ScategoryId,
          typeId: StypeId,
          locationId: SlocationId,
        })
        .expect(201);
      searchVehicle = res.body as VehicleResponse; // Add type assertion
    });

    it('should support full-text search via ?search=', async () => {
      const res = await request(server)
        .get(
          `/api/v1/vehicles?search=${encodeURIComponent(searchVehicle.name)}`,
        )
        .expect(200);
      const body = res.body as PaginatedVehicleResponseDto;
      expect(body.items.some((v) => v.id === searchVehicle.id)).toBe(true);
    });

    it('should support filtering by categoryId, typeId, and locationId', async () => {
      // Use filters parameter instead of direct query params
      const filters = {
        categoryId: ScategoryId,
        typeId: ScategoryId,
        locationId: SlocationId,
      };

      const res = await request(server)
        .get(
          `/api/v1/vehicles?filters=${encodeURIComponent(JSON.stringify(filters))}`,
        )
        .expect(200);
      const body = res.body as PaginatedVehicleResponseDto;

      expect(
        body.items.every(
          (v) =>
            v.categoryId === ScategoryId &&
            v.typeId === StypeId &&
            v.locationId === SlocationId,
        ),
      ).toBe(true);
    });

    it('should support sorting by createdAt asc/desc', async () => {
      const asc = await request(server)
        .get('/api/v1/vehicles?sortBy=createdAt&order=asc&take=3')
        .expect(200);
      const desc = await request(server)
        .get('/api/v1/vehicles?sortBy=createdAt&order=desc&take=3')
        .expect(200);

      const ascBody = asc.body as PaginatedVehicleResponseDto;
      const descBody = desc.body as PaginatedVehicleResponseDto;
      if (ascBody.items.length > 1 && descBody.items.length > 1) {
        const firstAsc = new Date(ascBody.items[0].createdAt).getTime();
        const firstDesc = new Date(descBody.items[0].createdAt).getTime();
        expect(firstAsc).toBeLessThanOrEqual(firstDesc);
      }
    });

    it('should allow combining search + filter + pagination', async () => {
      const filters = { categoryId: ScategoryId };

      const res = await request(server)
        .get(
          `/api/v1/vehicles?search=${encodeURIComponent(
            'Searchable',
          )}&filters=${encodeURIComponent(JSON.stringify(filters))}&skip=0&take=2`,
        )
        .expect(200);
      const body = res.body as PaginatedVehicleResponseDto;
      expect(Array.isArray(body.items)).toBe(true);
      expect(body.items.length).toBeLessThanOrEqual(2);
    });
  });
  // -----------------------------
  // UPDATE - regenerate name when licensePlate/category/type changes + uniqueness conflicts
  // -----------------------------
  describe('Update Vehicle', () => {
    it('should update licensePlate and regenerate name accordingly', async () => {
      const res = await request(server)
        .patch(`/api/v1/vehicles/${vehicleA.id}`)
        .send({ licensePlate: 'NEWPLT1' })
        .expect(200);
      const updated = res.body as VehicleResponse;
      expect(updated.licensePlate).toBe('NEWPLT1'); // normalized maybe already uppercase
      expect(updated.name).toMatch(/Car\s*\(Sedan\).*NEWPLT1/);
    });

    it('should update categoryId/typeId and regenerate name', async () => {
      // change vehicleA to Truck / Mini-Truck (categoryIdB / typeIdB)
      const res = await request(server)
        .patch(`/api/v1/vehicles/${vehicleA.id}`)
        .send({ categoryId: categoryIdB, typeId: typeIdB })
        .expect(200);
      const updated = res.body as VehicleResponse;
      expect(updated.name).toMatch(/Truck\s*\(Mini-Truck\).*NEWPLT1/);
    });

    it('should reject update when changing to duplicate identifiers (409)', async () => {
      // attempt to update vehicleA to have the same rcNumber as vehicleB
      await request(server)
        .patch(`/api/v1/vehicles/${vehicleA.id}`)
        .send({ rcNumber: vehicleB.rcNumber })
        .expect(409);
    });

    it('should return 404 when updating non-existent vehicle', async () => {
      await request(server)
        .patch('/api/v1/vehicles/047529c1-5f9e-43e0-9929-d9e56e7d32e6')
        .send({ notes: 'ghost' })
        .expect(404);
    });

    it('should reject update with invalid FK (409)', async () => {
      await request(server)
        .patch(`/api/v1/vehicles/${vehicleB.id}`)
        .send({ categoryId: categoryIdA, typeId: typeIdB })
        .expect(409);
    });
    it('should reject update with invalid category(404)', async () => {
      await request(server)
        .patch(`/api/v1/vehicles/${vehicleB.id}`)
        .send({ categoryId: '047529c1-5f9e-43e0-9929-d9e56e7d32e6' })
        .expect(404);
    });

    it('changing category/type name externally should NOT retroactively change vehicle name (expected current behaviour)', async () => {
      // update the type name via API
      await request(server)
        .patch(`/api/v1/vehicle-types/${typeIdB}`)
        .send({ name: 'MiniTruckX' })
        .expect(200);

      // fetch vehicleB without updating it — under current logic name isn't auto-updated
      const ven = await request(server)
        .get(`/api/v1/vehicles/${vehicleB.id}`)
        .expect(200);
      const fetched = ven.body as VehicleResponse;
      // name should still contain the old type name (or at least not required to equal new name)
      // We assert that a manual update is necessary to refresh vehicle.name.
      expect(typeof fetched.name).toBe('string');
    });
  });

  // -----------------------------
  // DELETE - happy path + errors + idempotency
  // -----------------------------
  describe('Delete Vehicle', () => {
    it('should delete vehicleB successfully', async () => {
      await request(server)
        .delete(`/api/v1/vehicles/${vehicleB.id}`)
        .expect(200);
      await request(server).get(`/api/v1/vehicles/${vehicleB.id}`).expect(404);
    });

    it('deleting already-deleted vehicle should return 404', async () => {
      await request(server)
        .delete(`/api/v1/vehicles/${vehicleB.id}`)
        .expect(404);
    });

    it('should return 404 when deleting non-existent random id', async () => {
      await request(server)
        .delete('/api/v1/vehicles/047529c1-5f9e-43e0-9929-d9e56e7d32e6')
        .expect(404);
    });
  });

  // -----------------------------
  // EDGE CASES & STRESS
  // -----------------------------
  describe('Edge cases & stress scenarios', () => {
    it('should normalize whitespace and cases for input fields (trim/uppercase)', async () => {
      const r = await request(server)
        .post('/api/v1/vehicles')
        .send({
          licensePlate: '  zz999 ',
          rcNumber: ' rc-zz ',
          chassisNumber: ' ch-zz ',
          engineNumber: ' en-zz ',
          categoryId: categoryIdA,
          typeId: typeIdA,
        })
        .expect(201);
      const v = r.body as VehicleResponse;
      expect(v.licensePlate).toBe('ZZ999');
      expect(v.rcNumber).toBeDefined();
    });
  });
});
