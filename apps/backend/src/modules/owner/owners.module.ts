import { Module } from '@nestjs/common';
import { OwnerController } from './owner.controller';
import { OwnerService } from './owner.service';
import { OwnerValidationService } from './validation/owner-validation.service';

@Module({
  controllers: [OwnerController],
  providers: [OwnerService, OwnerValidationService],
  exports: [OwnerService],
})
export class OwnersModule {}
