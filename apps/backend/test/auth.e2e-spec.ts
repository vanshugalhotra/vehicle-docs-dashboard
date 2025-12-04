import { INestApplication } from '@nestjs/common';
import { Express } from 'express';
import * as request from 'supertest';
import { PrismaService } from '../src/prisma/prisma.service';
import { createTestApp } from './utils/e2e-setup/app-setup';
import { UserResponseDto } from 'src/modules/auth/dto/auth.dto';

describe('Auth E2E (comprehensive)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let server: Express;

  const email = 'testuser@example.com';
  const password = 'password123';

  beforeAll(async () => {
    app = await createTestApp();
    prisma = app.get(PrismaService);
    server = app.getHttpServer() as unknown as Express;

    // cleanup users first (avoid duplicate)
    await prisma.user.deleteMany({});
  });

  afterAll(async () => {
    await prisma.user.deleteMany({});
    await app.close();
  });

  // ────────────────────────────────────────────────
  // CREATE USER
  // ────────────────────────────────────────────────
  describe('POST /api/v1/auth/create-user', () => {
    it('should create a new user', async () => {
      const res = await request(server)
        .post('/api/v1/auth/create-user')
        .set('x-admin-secret', process.env.AUTH_ADMIN_SECRET!)
        .send({ email, password })
        .expect(201);

      const body = res.body as UserResponseDto;
      expect(body.email).toBe(email);
      expect(body).toHaveProperty('id');
    });

    it('should reject duplicate user registration', async () => {
      await request(server)
        .post('/api/v1/auth/create-user')
        .set('x-admin-secret', process.env.AUTH_ADMIN_SECRET!)
        .send({ email, password })
        .expect(409);
    });
  });

  // ────────────────────────────────────────────────
  // LOGIN
  // ────────────────────────────────────────────────
  describe('POST /api/v1/auth/login', () => {
    it('should login successfully and set auth cookie', async () => {
      const res = await request(server)
        .post('/api/v1/auth/login')
        .send({ email, password })
        .expect(200);

      const cookies = res.headers['set-cookie'] as unknown as string[];
      expect(cookies).toBeDefined();
      expect(
        cookies.some((c: string) =>
          c.includes(process.env.AUTH_COOKIE_NAME ?? 'token'),
        ),
      ).toBe(true);
    });

    it('should reject invalid password', async () => {
      await request(server)
        .post('/api/v1/auth/login')
        .send({ email, password: 'wrongpw' })
        .expect(401);
    });

    it('should reject missing payload', async () => {
      await request(server).post('/api/v1/auth/login').send({}).expect(400);
    });
  });

  // ────────────────────────────────────────────────
  // PROTECTED ROUTE ACCESS
  // ────────────────────────────────────────────────
  describe('Auth Guard behavior example', () => {
    it('should block request without cookie', async () => {
      await request(server).get('/api/v1/drivers').expect(401);
    });

    it('should allow request with cookie after login', async () => {
      const login = await request(server)
        .post('/api/v1/auth/login')
        .send({ email, password });

      const cookie = login.headers['set-cookie'];

      await request(server)
        .get('/api/v1/drivers')
        .set('Cookie', cookie)
        .expect(200);
    });
  });

  // ────────────────────────────────────────────────
  // LOGOUT
  // ────────────────────────────────────────────────
  describe('POST /api/v1/auth/logout', () => {
    it('should clear auth cookie on logout', async () => {
      const login = await request(server)
        .post('/api/v1/auth/login')
        .send({ email, password });

      const cookie = login.headers['set-cookie'];

      const logoutRes = await request(server)
        .post('/api/v1/auth/logout')
        .set('Cookie', cookie)
        .expect(200);

      const logoutCookies = logoutRes.headers[
        'set-cookie'
      ] as unknown as string[];
      expect(
        logoutCookies.some((c: string) =>
          c.includes(process.env.AUTH_COOKIE_NAME ?? 'token'),
        ),
      ).toBe(true);
    });
  });
});
