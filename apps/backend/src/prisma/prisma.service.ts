import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { PrismaClient } from 'src/generated';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  /**
   * Connect to the database when module initializes
   */
  async onModuleInit(this: PrismaService): Promise<void> {
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

  /**
   * Disconnect from the database when module shuts down
   */
  async onModuleDestroy(this: PrismaService): Promise<void> {
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
