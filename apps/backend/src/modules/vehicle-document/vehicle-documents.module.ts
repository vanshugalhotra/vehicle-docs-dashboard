import { Module } from '@nestjs/common';
import { VehicleDocumentService } from './vehicle-document.service';
import { VehicleDocumentController } from './vehicle-document.controller';
import { VehicleDocumentValidationService } from './validation/vehicle-document-validation.service';

@Module({
  controllers: [VehicleDocumentController],
  providers: [VehicleDocumentService, VehicleDocumentValidationService],
})
export class VehicleDocumentsModule {}
