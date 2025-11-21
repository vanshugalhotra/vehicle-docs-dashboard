import { Suspense } from "react";
import AddDocumentTypePage from "./AddDocumentTypePage";

export default function Page() {
  return (
    <Suspense>
      <AddDocumentTypePage />
    </Suspense>
  );
}
