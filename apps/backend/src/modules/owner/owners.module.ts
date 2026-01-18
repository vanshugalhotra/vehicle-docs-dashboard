import { Module } from '@nestjs/common';
import { OwnerController } from './owner.controller';
import { OwnerService } from './owner.service';
import { OwnerValidationService } from './validation/owner-validation.service';
import { AuditService } from '../audit/audit.service';

@Module({
  controllers: [OwnerController],
  providers: [OwnerService, OwnerValidationService, AuditService],
  exports: [OwnerService],
})
export class OwnersModule {}
