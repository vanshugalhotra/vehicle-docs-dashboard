import { EntitySelector } from "@/components/ui/EntitySelector/EntitySelector";
import { apiRoutes } from "@/lib/apiRoutes";
import { Building2, Hash, Key, MapPin, User } from "lucide-react";
import type { VehicleResponse } from "@/lib/types/vehicle.types";

interface VehicleSelectorProps {
  onSelect?: (vehicle: VehicleResponse | null) => void;
}

export default function VehicleSelector({ onSelect }: VehicleSelectorProps) {
  return (
    <EntitySelector<VehicleResponse>
      label="Vehicle"
      endpoint={apiRoutes.vehicles.list}
      transformOption={(data) =>
        data.map((v) => ({
          label: `${v.name}`,
          value: v.id,
        }))
      }
      variant="detailed"
      placeholder="Select a Vehicle...."
      onSelect={onSelect}
      renderFields={(v) => [
        {
          label: "Category",
          value: v.categoryName,
          icon: <Building2 className="w-4 h-4" />,
        },
        {
          label: "Type",
          value: v.typeName,
          icon: <Hash className="w-4 h-4" />,
        },
        {
          label: "Driver",
          value: v.driverName,
          icon: <User className="w-4 h-4" />,
        },
        {
          label: "Owner",
          value: v.ownerName,
          icon: <User className="w-4 h-4" />,
        },
        {
          label: "Location",
          value: v.locationName,
          icon: <MapPin className="w-4 h-4" />,
        },
        {
          label: "RC No.",
          value: v.rcNumber,
          icon: <Hash className="w-4 h-4" />,
        },
        {
          label: "Chassis No.",
          value: v.chassisNumber,
          icon: <Key className="w-4 h-4" />,
        },
        {
          label: "Engine No.",
          value: v.engineNumber,
          icon: <Key className="w-4 h-4" />,
        },
      ]}
    />
  );
}