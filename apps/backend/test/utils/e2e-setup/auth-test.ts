import * as request from 'supertest';
import { App } from 'supertest/types';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

let globalAuthCookie: string[] = [];
export const getAuthCookie = () => globalAuthCookie;

/**
 * Runs once in beforeAll of main test suite
 * Cleans users, creates user, logs in, stores cookie globally
 */
export const setupTestAuth = async (server: any) => {
  const email = 'testadmin@example.com';
  const password = 'password123';

  await prisma.user.deleteMany({});

  await request(server as App)
    .post('/api/v1/users')
    .set('x-admin-secret', process.env.AUTH_ADMIN_SECRET!)
    .send({ email, password })
    .expect(201);

  const loginRes = await request(server as App)
    .post('/api/v1/auth/login')
    .send({ email, password })
    .expect(200);

  globalAuthCookie = loginRes.headers['set-cookie'] as unknown as string[];

  if (!globalAuthCookie) {
    throw new Error('Failed to store global authentication cookie');
  }

  console.log('Global auth cookie initialized');
};

/**
 * Authed request wrapper
 */
export const authedRequest = (server: any) => ({
  get: (url: string) =>
    request(server as App)
      .get(url)
      .set('Cookie', globalAuthCookie),
  post: (url: string) =>
    request(server as App)
      .post(url)
      .set('Cookie', globalAuthCookie),
  patch: (url: string) =>
    request(server as App)
      .patch(url)
      .set('Cookie', globalAuthCookie),
  delete: (url: string) =>
    request(server as App)
      .delete(url)
      .set('Cookie', globalAuthCookie),
});
