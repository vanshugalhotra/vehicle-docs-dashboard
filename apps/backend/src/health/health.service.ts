import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as os from 'os';

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);

  constructor(private readonly prisma: PrismaService) {}

  basic() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }

  live() {
    return { status: 'alive' };
  }

  async readiness() {
    const databaseOk = await this.checkDatabase();

    return {
      status: databaseOk ? 'ready' : 'not_ready',
      checks: {
        database: databaseOk ? 'ok' : 'down',
      },
    };
  }

  info() {
    return {
      status: 'ok',
      version: process.env.npm_package_version ?? 'unknown',
      env: process.env.NODE_ENV ?? 'unknown',
      timestamp: new Date().toISOString(),
    };
  }

  async stats() {
    const databaseOk = await this.checkDatabase();

    return {
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV ?? 'unknown',
      version: process.env.npm_package_version ?? 'unknown',
      nodeVersion: process.version,
      memory: {
        total: os.totalmem(),
        free: os.freemem(),
        used: os.totalmem() - os.freemem(),
      },
      cpu: {
        count: os.cpus().length,
        loadAvg: os.loadavg(), // 1m / 5m / 15m
      },
      checks: {
        database: databaseOk ? 'ok' : 'down',
      },
    };
  }

  async checkDatabase(): Promise<boolean> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return true;
    } catch (err) {
      this.logger.error('Database health check failed:', err);
      return false;
    }
  }
}
