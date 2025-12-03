import { Module } from '@nestjs/common';
import { VehicleDocumentService } from './vehicle-document.service';
import { VehicleDocumentController } from './vehicle-document.controller';
import { VehicleDocumentValidationService } from './validation/vehicle-document-validation.service';
// import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  // imports: [EventEmitterModule.forRoot()],
  controllers: [VehicleDocumentController],
  providers: [VehicleDocumentService, VehicleDocumentValidationService],
  exports: [VehicleDocumentService],
})
export class VehicleDocumentsModule {}
