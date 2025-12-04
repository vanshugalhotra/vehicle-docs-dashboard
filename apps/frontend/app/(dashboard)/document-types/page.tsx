import { Suspense } from "react";
import DocumentTypePage from "./DocumentTypePage";

export default function Page() {
  return (
    <Suspense>
      <DocumentTypePage />
    </Suspense>
  );
}
