import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ConfigService } from '../config/config.service';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor(private readonly configService: ConfigService) {
    super({
      log:
        configService.get('NODE_ENV') === 'development'
          ? ['warn', 'error']
          : ['warn', 'error'],
    });
    process.setMaxListeners(20);
  }

  async onModuleInit(): Promise<void> {
    this.logger.log('Initializing Prisma Service...');
    try {
      await this.$connect();
      this.logger.log('✅ Prisma connected');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      const stack = err instanceof Error ? err.stack : undefined;
      this.logger.error(`❌ Prisma connection failed: ${msg}`, stack);
      throw err;
    }
  }

  async onModuleDestroy(): Promise<void> {
    this.logger.log('Shutting down Prisma Service...');
    try {
      await this.$disconnect();
      this.logger.log('🛑 Prisma disconnected');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      const stack = err instanceof Error ? err.stack : undefined;
      this.logger.error(`❌ Prisma disconnect failed: ${msg}`, stack);
    }
  }
}
