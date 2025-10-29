import { Module } from '@nestjs/common';
import { DocumentTypesController } from './document-type.controller';
import { DocumentTypesService } from './document-type.service';

@Module({
  controllers: [DocumentTypesController],
  providers: [DocumentTypesService],
  exports: [DocumentTypesService],
})
export class DocumentTypesModule {}
