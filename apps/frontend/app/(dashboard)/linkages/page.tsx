import { Suspense } from "react";
import LinkagePage from "./LinkagePage";

export default function Page() {
  return (
    <Suspense>
      <LinkagePage />
    </Suspense>
  );
}
