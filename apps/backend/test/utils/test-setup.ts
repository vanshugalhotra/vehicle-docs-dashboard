import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../src/prisma/prisma.service';
import { LoggerService } from '../../src/common/logger/logger.service';
import { mockPrisma, MockedPrisma } from './mock-prisma';
import { mockLogger, MockedLogger } from './mock-logger';

export interface MockContext {
  prisma: MockedPrisma;
  logger: MockedLogger;
}

export async function createTestModule<T>(
  provider: new (...args: any[]) => T,
): Promise<{ module: TestingModule; service: T; mocks: MockContext }> {
  const prisma = mockPrisma();
  const logger = mockLogger();

  const module: TestingModule = await Test.createTestingModule({
    providers: [
      provider,
      { provide: PrismaService, useValue: prisma },
      { provide: LoggerService, useValue: logger },
    ],
  }).compile();

  const service = module.get<T>(provider);
  return { module, service, mocks: { prisma, logger } };
}
