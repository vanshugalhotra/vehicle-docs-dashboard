import { VehicleDocumentResponse } from 'src/common/types';

export function statusResolver(
  value:
    | 'expired'
    | 'active'
    | 'expiringSoon'
    | { type: 'expired' | 'active' | 'expiringSoon'; withinDays?: number },
) {
  return (doc: VehicleDocumentResponse) => {
    const now = new Date();
    const expiry = new Date(doc.expiryDate);
    const daysRemaining = Math.floor(
      (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    );

    // Extract type and withinDays
    let type: 'expired' | 'active' | 'expiringSoon';
    let withinDays: number = 30; // default

    if (typeof value === 'string') {
      type = value;
    } else {
      type = value.type;
      withinDays = value.withinDays ?? 30; // use provided or default 30
    }

    switch (type) {
      case 'expired':
        return expiry < now;
      case 'active':
        return expiry >= now;
      case 'expiringSoon':
        return expiry >= now && daysRemaining <= withinDays;
      default:
        return true;
    }
  };
}
