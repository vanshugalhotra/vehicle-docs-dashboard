import { Suspense } from "react";
import VehiclesPage from "./VehiclesPage";

export default function Page() {
  return (
    <Suspense>
      <VehiclesPage />
    </Suspense>
  );
}
