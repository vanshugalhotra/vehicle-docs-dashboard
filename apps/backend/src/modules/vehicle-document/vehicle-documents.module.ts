import { Module } from '@nestjs/common';
import { VehicleDocumentService } from './vehicle-document.service';
import { VehicleDocumentController } from './vehicle-document.controller';

@Module({
  controllers: [VehicleDocumentController],
  providers: [VehicleDocumentService],
})
export class VehicleDocumentsModule {}
