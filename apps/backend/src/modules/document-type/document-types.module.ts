import { Module } from '@nestjs/common';
import { DocumentTypeController } from './document-type.controller';
import { DocumentTypesService } from './document-type.service';
import { DocumentTypeValidationService } from './validation/document-type-validation.service';

@Module({
  controllers: [DocumentTypeController],
  providers: [DocumentTypesService, DocumentTypeValidationService],
  exports: [DocumentTypesService],
})
export class DocumentTypesModule {}
