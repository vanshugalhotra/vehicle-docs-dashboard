import { BusinessFilterEngine } from 'src/common/business-filters/engine';
import { VEHICLE_BUSINESS_RESOLVERS } from './business-resolver.map';
import { VehicleResponseDto } from '../dto/vehicle-response.dto';

/**
 * Factory function to create a BusinessFilterEngine
 * specifically for Vehicles.
 */
export function createVehicleBusinessEngine() {
  return new BusinessFilterEngine<VehicleResponseDto>(
    VEHICLE_BUSINESS_RESOLVERS,
  );
}
