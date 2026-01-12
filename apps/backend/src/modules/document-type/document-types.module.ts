import { Module } from '@nestjs/common';
import { DocumentTypeController } from './document-type.controller';
import { DocumentTypesService } from './document-type.service';
import { DocumentTypeValidationService } from './validation/document-type-validation.service';
import { AuditService } from '../audit/audit.service';

@Module({
  controllers: [DocumentTypeController],
  providers: [
    DocumentTypesService,
    DocumentTypeValidationService,
    AuditService,
  ],
  exports: [DocumentTypesService],
})
export class DocumentTypesModule {}
