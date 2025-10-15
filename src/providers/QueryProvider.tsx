"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";

export default function QueryProvider({ children }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 0, // Always consider data stale (will refetch on filter change)
            gcTime: 5 * 60 * 1000, // 5 minutes cache time (reduced)
            retry: 3,
            retryDelay: (attemptIndex) =>
              Math.min(1000 * 2 ** attemptIndex, 30000),
            refetchOnWindowFocus: false,
            refetchOnReconnect: "always",
          },
          mutations: {
            retry: 1,
          },
        },
      })
  );

  // Add global debugging function to clear cache
  if (typeof window !== 'undefined') {
    (window as any).clearReactQueryCache = () => {
      queryClient.clear();
      console.log('🧹 React Query cache cleared');
    };
  }

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
