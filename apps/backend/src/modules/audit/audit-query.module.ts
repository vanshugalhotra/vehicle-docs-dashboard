import { Module } from '@nestjs/common';
import { AuditController } from './audit-query.controller';
import { AuditQueryService } from './audit-query.service';

@Module({
  controllers: [AuditController],
  providers: [AuditQueryService],
  exports: [AuditQueryService],
})
export class AuditQueryModule {}
