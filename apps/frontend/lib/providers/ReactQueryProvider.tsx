"use client";

import {
  QueryClient,
  QueryClientProvider,
  QueryCache,
  MutationCache,
} from "@tanstack/react-query";
import { useState } from "react";
import GlobalLoadingIndicator from "@/components/layout/loading/GlobalLoadingIndicator";
import { toastUtils } from "@/lib/utils/toastUtils";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        queryCache: new QueryCache({
          onError: (error: Error) => {
            toastUtils.error(error?.message ?? "Something went wrong");
          },
        }),
        mutationCache: new MutationCache({
          onError: (error: Error) => {
            toastUtils.error(error?.message ?? "Something went wrong");
          },
        }),
        defaultOptions: {
          queries: {
            retry: 1,
            staleTime: 1000 * 60, // 1 minute
          },
          mutations: {
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <GlobalLoadingIndicator />
      {children}
    </QueryClientProvider>
  );
}
