import { Module } from '@nestjs/common';
import { DocumentTypeController } from './document-type.controller';
import { DocumentTypesService } from './document-type.service';

@Module({
  controllers: [DocumentTypeController],
  providers: [DocumentTypesService],
  exports: [DocumentTypesService],
})
export class DocumentTypesModule {}
