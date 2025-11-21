import {
  VehicleResponseDto,
  VehicleDocumentItemDto,
} from '../dto/vehicle-response.dto';

export function missingDocsResolver(config: {
  list: string[];
  mode: 'AND' | 'OR';
}) {
  const { list, mode } = config;

  return (vehicle: VehicleResponseDto) => {
    const docs = vehicle.documents ?? [];
    const types = docs.map((d: VehicleDocumentItemDto) => d.documentTypeName);

    // Check missing for each required type
    const missingChecks = list.map((required) => !types.includes(required));

    if (mode === 'AND') {
      // All must be missing
      return missingChecks.every(Boolean);
    }

    // OR mode → any must be missing
    return missingChecks.some(Boolean);
  };
}
