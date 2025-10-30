import { Global, Module } from '@nestjs/common';
import { BaseValidationService } from './base-validation.service';

@Global()
@Module({
  providers: [BaseValidationService],
  exports: [BaseValidationService],
})
export class ValidationModule {}
