import { VehicleDocumentResponse } from 'src/common/types';
import { BusinessResolverMap } from 'src/common/business-filters/engine';
import { statusResolver } from './statusResolver';

/**
 * Business resolvers for VehicleDocument entities
 */
export const LINKAGE_BUSINESS_RESOLVERS: BusinessResolverMap<VehicleDocumentResponse> =
  {
    status: {
      description:
        'Filter documents by status: expired, active, expiringSoon with optional withinDays',
      predicate: (doc: VehicleDocumentResponse, value: unknown) => {
        // value can be:
        // 1) "expired" | "active" | "expiringSoon"
        // 2) { type: "expired" | "active" | "expiringSoon", withinDays?: number }
        const predicate = statusResolver(
          value as
            | 'expired'
            | 'active'
            | 'expiringSoon'
            | {
                type: 'expired' | 'active' | 'expiringSoon';
                withinDays?: number;
              },
        );
        return predicate(doc);
      },
    },
  };
