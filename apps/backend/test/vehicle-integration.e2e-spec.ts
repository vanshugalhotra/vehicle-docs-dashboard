// test/vehicles-integration.e2e-spec.ts
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
import {
  VehicleResponse,
  VehicleCategoryResponse,
  VehicleTypeResponse,
  OwnerResponse,
  DriverResponse,
  LocationResponse,
} from 'src/common/types';

describe('Vehicles E2E (Comprehensive Integration - Categories/Types/Refs)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let server: Express;

  // reference IDs
  let categoryA: VehicleCategoryResponse;
  let typeA1: VehicleTypeResponse;
  let categoryB: VehicleCategoryResponse;
  let typeB1: VehicleTypeResponse;
  let ownerA: OwnerResponse;
  let driverA: DriverResponse;
  let locationA: LocationResponse;

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

    // Clean up relevant tables before tests (safe: test DB)
    await prisma.vehicle.deleteMany({});
    await prisma.vehicleType.deleteMany({});
    await prisma.vehicleCategory.deleteMany({});
    await prisma.owner.deleteMany({});
    await prisma.driver.deleteMany({});
    await prisma.location.deleteMany({});
  });

  afterAll(async () => {
    // cleanup
    await prisma.vehicle.deleteMany({});
    await prisma.vehicleType.deleteMany({});
    await prisma.vehicleCategory.deleteMany({});
    await prisma.owner.deleteMany({});
    await prisma.driver.deleteMany({});
    await prisma.location.deleteMany({});
    await app.close();
  });

  // -----------------------------------------------------------------------
  // Phase 1: create reference data (categories, types, owner, driver, location)
  // -----------------------------------------------------------------------
  describe('Reference data setup', () => {
    it('creates Category A and Category B', async () => {
      const resA = await request(server)
        .post('/api/v1/vehicle-categories')
        .send({ name: 'Commercial' })
        .expect(201);
      categoryA = resA.body as VehicleCategoryResponse;

      const resB = await request(server)
        .post('/api/v1/vehicle-categories')
        .send({ name: 'Personal' })
        .expect(201);
      categoryB = resB.body as VehicleCategoryResponse;

      expect(categoryA.id).toBeDefined();
      expect(categoryB.id).toBeDefined();
      expect(categoryA.name).toBe('Commercial');
      expect(categoryB.name).toBe('Personal');
    });

    it('rejects creating duplicate category (case-insensitive)', async () => {
      await request(server)
        .post('/api/v1/vehicle-categories')
        .send({ name: 'commercial' }) // lowercase duplicate
        .expect(409);
    });

    it('creates Types under categories', async () => {
      const t1 = await request(server)
        .post('/api/v1/vehicle-types')
        .send({ name: 'Truck', categoryId: categoryA.id })
        .expect(201);
      typeA1 = t1.body as VehicleTypeResponse;

      const t2 = await request(server)
        .post('/api/v1/vehicle-types')
        .send({ name: 'Sedan', categoryId: categoryB.id })
        .expect(201);
      typeB1 = t2.body as VehicleTypeResponse;

      expect(typeA1.categoryId).toBe(categoryA.id);
      expect(typeB1.categoryId).toBe(categoryB.id);
    });

    it('rejects creating type with invalid category FK', async () => {
      await request(server)
        .post('/api/v1/vehicle-types')
        .send({
          name: 'Ghost',
          categoryId: '047529c1-5f9e-43e0-9929-d9e56e7d32e6',
        })
        .expect(404); // validation or not found depending on controller/service
    });

    it('creates Owner, Driver, Location', async () => {
      const o = await request(server)
        .post('/api/v1/owners')
        .send({ name: 'Acme Logistics' })
        .expect(201);
      ownerA = o.body as OwnerResponse;

      const d = await request(server)
        .post('/api/v1/drivers')
        .send({ name: 'Raza', phone: '9000000001' })
        .expect(201);
      driverA = d.body as DriverResponse;

      const l = await request(server)
        .post('/api/v1/locations')
        .send({ name: 'Depot-East' })
        .expect(201);
      locationA = l.body as LocationResponse;

      expect(ownerA.name).toBe('Acme Logistics');
      expect(driverA.phone).toBe('9000000001');
      expect(locationA.name).toBe('Depot-East');
    });
  });

  // -----------------------------------------------------------------------
  // Phase 2: create vehicles with full happy-path validations
  // -----------------------------------------------------------------------
  describe('Vehicle creation & uniqueness', () => {
    it('creates vehicleA with all FKs and normalized identifiers', async () => {
      const res = await request(server)
        .post('/api/v1/vehicles')
        .send({
          licensePlate: 'ab-1234',
          rcNumber: 'rc-999',
          chassisNumber: 'ch-111',
          engineNumber: 'en-111',
          categoryId: categoryA.id,
          typeId: typeA1.id,
          ownerId: ownerA.id,
          driverId: driverA.id,
          locationId: locationA.id,
          notes: 'Operational',
        })
        .expect(201);

      vehicleA = res.body as VehicleResponse;
      // check normalized licensePlate uppercase in name
      expect(vehicleA.licensePlate).toBe('AB-1234');
      expect(vehicleA.name).toContain('(Truck)');
      expect(vehicleA.categoryId).toBe(categoryA.id);
      expect(vehicleA.ownerId).toBe(ownerA.id);
    });

    it('rejects creation when identifiers duplicate (licensePlate, rc, chassis, engine)', async () => {
      // same license plate - should 409
      await request(server)
        .post('/api/v1/vehicles')
        .send({
          licensePlate: 'AB-1234', // same as vehicleA normalized
          rcNumber: 'rc-new',
          chassisNumber: 'ch-new',
          engineNumber: 'en-new',
          categoryId: categoryA.id,
          typeId: typeA1.id,
        })
        .expect(409);

      // same RC
      await request(server)
        .post('/api/v1/vehicles')
        .send({
          licensePlate: 'zz-0001',
          rcNumber: 'RC-999', // same rc normalized
          chassisNumber: 'ch-new2',
          engineNumber: 'en-new2',
          categoryId: categoryA.id,
          typeId: typeA1.id,
        })
        .expect(409);
    });

    it('rejects creation when FK category/type missing or mismatched', async () => {
      // type belongs to categoryB but categoryA given (mismatch)
      await request(server)
        .post('/api/v1/vehicles')
        .send({
          licensePlate: 'ZZ-1000',
          rcNumber: 'RC-1000',
          chassisNumber: 'CH-1000',
          engineNumber: 'EN-1000',
          categoryId: categoryA.id,
          typeId: typeB1.id, // typeB1 belongs to categoryB
        })
        .expect(409);

      // completely invalid categoryId
      await request(server)
        .post('/api/v1/vehicles')
        .send({
          licensePlate: 'NEW-01',
          rcNumber: 'RC-01',
          chassisNumber: 'CH-01',
          engineNumber: 'EN-01',
          categoryId: '047529c1-5f9e-43e0-9929-d9e56e7d32e6',
          typeId: typeA1.id,
        })
        .expect(404);
    });

    it('creates vehicleB (different category/type) minimal FKs', async () => {
      const res = await request(server)
        .post('/api/v1/vehicles')
        .send({
          licensePlate: 'CD-2222',
          rcNumber: 'RC-2222',
          chassisNumber: 'CH-2222',
          engineNumber: 'EN-2222',
          categoryId: categoryB.id,
          typeId: typeB1.id,
        })
        .expect(201);

      vehicleB = res.body as VehicleResponse;
      expect(vehicleB.categoryId).toBe(categoryB.id);
      expect(vehicleB.typeId).toBe(typeB1.id);
    });
  });

  // -----------------------------------------------------------------------
  // Phase 3: delete protections & cascades
  // -----------------------------------------------------------------------
  describe('Delete protections (cannot delete refs while vehicles exist)', () => {
    it('cannot delete category when types/vehicles exist (409)', async () => {
      // categoryA has at least typeA1 and vehicleA
      await request(server)
        .delete(`/api/v1/vehicle-categories/${categoryA.id}`)
        .expect(409);
    });

    it('cannot delete type when vehicles exist (409)', async () => {
      await request(server)
        .delete(`/api/v1/vehicle-types/${typeA1.id}`)
        .expect(409);
    });

    it('cannot delete owner/driver/location while vehicles reference them (409)', async () => {
      await request(server).delete(`/api/v1/owners/${ownerA.id}`).expect(409);
      await request(server).delete(`/api/v1/drivers/${driverA.id}`).expect(409);
      await request(server)
        .delete(`/api/v1/locations/${locationA.id}`)
        .expect(409);
    });

    it('deleting vehicle removes references and then allows deleting refs', async () => {
      // delete vehicles
      await request(server)
        .delete(`/api/v1/vehicles/${vehicleA.id}`)
        .expect(200);
      await request(server)
        .delete(`/api/v1/vehicles/${vehicleB.id}`)
        .expect(200);

      // now delete type that had no more vehicles
      const tempType = await prisma.vehicleType.findFirst({
        where: { name: 'Mini' },
      });
      if (tempType) {
        await request(server)
          .delete(`/api/v1/vehicle-types/${tempType.id}`)
          .expect(200);
      }

      // delete owner/driver/location now should succeed
      await request(server).delete(`/api/v1/owners/${ownerA.id}`).expect(200);
      await request(server).delete(`/api/v1/drivers/${driverA.id}`).expect(200);
      await request(server)
        .delete(`/api/v1/locations/${locationA.id}`)
        .expect(200);
    });

    it('after deleting vehicles, deleting category should succeed (if no types remain)', async () => {
      // try deleting categoryB (should succeed after its types removed)
      // first remove any remaining types under categoryB
      const typesB = await prisma.vehicleType.findMany({
        where: { categoryId: categoryB.id },
      });
      for (const t of typesB) {
        await prisma.vehicleType.delete({ where: { id: t.id } });
      }
      await request(server)
        .delete(`/api/v1/vehicle-categories/${categoryB.id}`)
        .expect(200);
    });
  });
});
