import { BusinessFilterEngine } from 'src/common/business-filters/engine';
import { LINKAGE_BUSINESS_RESOLVERS } from './business-resolver.map';
import { VehicleDocumentResponseDto } from '../dto/vehicle-document-response.dto';
/**
 * Factory function to create a BusinessFilterEngine
 * specifically for VehicleDocuments.
 */
export function createLinkageBusinessEngine() {
  return new BusinessFilterEngine<VehicleDocumentResponseDto>(
    LINKAGE_BUSINESS_RESOLVERS,
  );
}
