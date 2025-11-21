import { Suspense } from "react";
import AddVehiclesPage from "./AddVehiclePage";

export default function Page() {
  return (
    <Suspense>
      <AddVehiclesPage />
    </Suspense>
  );
}
