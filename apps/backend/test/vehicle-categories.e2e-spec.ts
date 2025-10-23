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
import { VehicleCategoryResponse } from 'src/common/types';
import { PaginatedCategoryResponseDto } from 'src/modules/vehicle-category/dto/category-response.dto';

describe('VehicleCategory E2E (comprehensive + extended)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let server: Express;

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

    // Ensure DB is clean before tests
    await prisma.vehicleType.deleteMany({});
    await prisma.vehicleCategory.deleteMany({});
  });

  afterAll(async () => {
    await prisma.vehicleType.deleteMany({});
    await prisma.vehicleCategory.deleteMany({});
    await app.close();
  });

  describe('Create Category', () => {
    it('should create a new category', async () => {
      const res = await request(server)
        .post('/api/v1/vehicle-categories')
        .send({ name: 'Sedan' })
        .expect(201);

      const body = res.body as VehicleCategoryResponse;
      expect(body.id).toBeDefined();
      expect(body.name).toBe('Sedan');
    });

    it('should throw 400 if name is missing', async () => {
      await request(server)
        .post('/api/v1/vehicle-categories')
        .send({})
        .expect(400);
    });

    it('should throw 409 if category already exists (case insensitive)', async () => {
      await request(server)
        .post('/api/v1/vehicle-categories')
        .send({ name: 'sedan' }) // lowercase
        .expect(409);
    });

    it('should not allow category with special chars in name', async () => {
      await request(server)
        .post('/api/v1/vehicle-categories')
        .send({ name: 'Electric-Compact@2025' })
        .expect(400);
    });

    it('should reject category with excessively long name', async () => {
      const longName = 'A'.repeat(300);
      await request(server)
        .post('/api/v1/vehicle-categories')
        .send({ name: longName })
        .expect(400);
    });
  });

  describe('Fetch Categories', () => {
    beforeAll(async () => {
      await prisma.vehicleCategory.createMany({
        data: [{ name: 'SUV' }, { name: 'Truck' }, { name: 'Motorbike' }],
      });
    });

    it('should fetch all categories', async () => {
      const res = await request(server)
        .get('/api/v1/vehicle-categories')
        .expect(200);

      const categories = res.body as PaginatedCategoryResponseDto;
      expect(categories.items.length).toBeGreaterThanOrEqual(4);
    });

    it('should fetch categories with search filter', async () => {
      const res = await request(server)
        .get('/api/v1/vehicle-categories?search=su')
        .expect(200);

      const categories = res.body as PaginatedCategoryResponseDto;
      expect(categories.items.length).toBe(1);
      expect(categories.items[0].name).toBe('SUV');
    });

    it('should fetch single category by ID', async () => {
      const category = await prisma.vehicleCategory.findFirst({
        where: { name: 'Truck' },
      });
      const res = await request(server)
        .get(`/api/v1/vehicle-categories/${category?.id}`)
        .expect(200);

      const fetched = res.body as VehicleCategoryResponse;
      expect(fetched.name).toBe('Truck');
    });

    it('should return 404 for non-existent category', async () => {
      await request(server)
        .get('/api/v1/vehicle-categories/047529c1-5f9e-43e0-9929-d9e56e7d32e6')
        .expect(404);
    });

    it('should return 400 for invalid UUID', async () => {
      await request(server)
        .get('/api/v1/vehicle-categories/invalid-uuid')
        .expect(400);
    });
  });

  describe('Fetch Category with Types Relationship', () => {
    let categoryId: string;

    beforeAll(async () => {
      const category = await prisma.vehicleCategory.create({
        data: { name: 'Crossover' },
      });
      categoryId = category.id;

      await prisma.vehicleType.createMany({
        data: [
          { name: 'Compact Crossover', categoryId },
          { name: 'Mid-size Crossover', categoryId },
        ],
      });
    });

    it('should fetch category with its types included', async () => {
      const res = await request(server)
        .get(`/api/v1/vehicle-categories/${categoryId}`)
        .expect(200);

      const category = res.body as VehicleCategoryResponse;
      expect(category.id).toBe(categoryId);
      expect(Array.isArray(category.types)).toBe(true);
      expect(category.types?.length).toBe(2);
      expect(category.types && category.types[0]).toHaveProperty('name');
    });

    it('should reflect updated types after deletion', async () => {
      const typeToDelete = await prisma.vehicleType.findFirst({
        where: { name: 'Compact Crossover' },
      });

      await prisma.vehicleType.delete({
        where: { id: typeToDelete!.id },
      });

      const res = await request(server)
        .get(`/api/v1/vehicle-categories/${categoryId}`)
        .expect(200);

      const category = res.body as VehicleCategoryResponse;
      expect(category.types?.length).toBe(1);
    });
  });

  describe('Update Category', () => {
    let categoryId: string;

    beforeAll(async () => {
      const category = await prisma.vehicleCategory.create({
        data: { name: 'MiniVan' },
      });
      categoryId = category.id;
    });

    it('should update category name', async () => {
      const res = await request(server)
        .patch(`/api/v1/vehicle-categories/${categoryId}`)
        .send({ name: 'Van' })
        .expect(200);

      const updated = res.body as VehicleCategoryResponse;
      expect(updated.name).toBe('Van');
    });

    it('should throw 409 on duplicate name', async () => {
      await request(server)
        .patch(`/api/v1/vehicle-categories/${categoryId}`)
        .send({ name: 'SUV' })
        .expect(409);
    });

    it('should throw 404 on non-existent category', async () => {
      await request(server)
        .patch(
          '/api/v1/vehicle-categories/047529c1-5f9e-43e0-9929-d9e56e7d32e6',
        )
        .send({ name: 'Ghost' })
        .expect(404);
    });
  });

  describe('Delete Category', () => {
    let categoryId: string;

    beforeAll(async () => {
      const category = await prisma.vehicleCategory.create({
        data: { name: 'TempDelete' },
      });
      categoryId = category.id;
    });

    it('should delete category successfully', async () => {
      await request(server)
        .delete(`/api/v1/vehicle-categories/${categoryId}`)
        .expect(200);

      const deleted = await prisma.vehicleCategory.findUnique({
        where: { id: categoryId },
      });
      expect(deleted).toBeNull();
    });

    it('should return 404 when deleting non-existent category', async () => {
      await request(server)
        .delete(`/api/v1/vehicle-categories/${categoryId}`)
        .expect(404);
    });

    it('should return 409 if category has dependent types', async () => {
      const category = await prisma.vehicleCategory.create({
        data: { name: 'HasTypes' },
      });
      await prisma.vehicleType.create({
        data: { name: 'Type1', categoryId: category.id },
      });

      await request(server)
        .delete(`/api/v1/vehicle-categories/${category.id}`)
        .expect(409);
    });
  });
});
