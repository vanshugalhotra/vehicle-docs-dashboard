import { Suspense } from "react";
import AddLinkagePage from "./AddLinkagePage";

export default function Page() {
  return (
    <Suspense>
      <AddLinkagePage />
    </Suspense>
  );
}
