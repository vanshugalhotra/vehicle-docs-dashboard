"use client";

import { useEffect } from "react";
import { useIsFetching, useIsMutating } from "@tanstack/react-query";
import NProgress from "nprogress";
import "nprogress/nprogress.css";

// Smooth + modern UX config
NProgress.configure({
  showSpinner: false,
  easing: "ease",
  speed: 400,
  trickle: true,
  trickleSpeed: 150,
  minimum: 0.08,
});

let state: "idle" | "loading" = "idle";

export default function GlobalLoadingIndicator() {
  const isFetching = useIsFetching();
  const isMutating = useIsMutating();

  const loading = isFetching + isMutating > 0;

  useEffect(() => {
    if (loading) {
      if (state === "loading") return;

      state = "loading";
      NProgress.start();       // instantly start
    } else {
      state = "idle";
      NProgress.done();        // instantly end
    }
  }, [loading]);

  return null;
}
