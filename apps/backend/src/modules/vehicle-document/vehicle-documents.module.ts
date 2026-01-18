import { Module } from '@nestjs/common';
import { VehicleDocumentService } from './vehicle-document.service';
import { VehicleDocumentController } from './vehicle-document.controller';
import { VehicleDocumentValidationService } from './validation/vehicle-document-validation.service';
// import { EventEmitterModule } from '@nestjs/event-emitter';
import { AuditService } from '../audit/audit.service';

@Module({
  // imports: [EventEmitterModule.forRoot()],
  controllers: [VehicleDocumentController],
  providers: [
    VehicleDocumentService,
    VehicleDocumentValidationService,
    AuditService,
  ],
  exports: [VehicleDocumentService],
})
export class VehicleDocumentsModule {}
