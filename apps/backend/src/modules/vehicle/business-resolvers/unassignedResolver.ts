import { VehicleResponseDto } from '../dto/vehicle-response.dto';

export function unassignedResolver(value: boolean) {
  return (vehicle: VehicleResponseDto) => {
    const isUnassigned = vehicle.documents?.length === 0;

    return value ? isUnassigned : !isUnassigned;
  };
}
