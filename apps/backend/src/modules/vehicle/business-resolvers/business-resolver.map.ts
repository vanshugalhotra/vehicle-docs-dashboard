import { unassignedResolver } from './unassignedResolver';
import { missingDocsResolver } from './missingDocResolver';
import { VehicleResponseDto } from '../dto/vehicle-response.dto';
import { BusinessResolverMap } from 'src/common/business-filters/engine';

/**
 * Map of business resolvers for vehicles.
 *
 * Each resolver.predicate is a function (entity, value) => boolean
 * We wrap your resolver factories (which return predicates) so they match
 * BusinessResolver interface directly.
 */
export const VEHICLE_BUSINESS_RESOLVERS: BusinessResolverMap<VehicleResponseDto> =
  {
    unassigned: {
      description: 'Vehicles with no assigned documents',
      predicate: (vehicle: VehicleResponseDto, value: unknown) => {
        // unassignedResolver returns a predicate function, so call it with the provided value
        const predicate = unassignedResolver(value as boolean);
        return predicate(vehicle);
      },
    },

    missingDocs: {
      description: 'Vehicles missing specified document types (list + mode)',
      predicate: (vehicle: VehicleResponseDto, value: unknown) => {
        // missingDocsResolver returns a predicate function (factory)
        // value is expected to be: { list: string[], mode: 'AND' | 'OR' }
        const predicate = missingDocsResolver(
          value as { list: string[]; mode: 'AND' | 'OR' },
        );
        return predicate(vehicle);
      },
    },
  };
