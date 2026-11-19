import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

/**
 * Enterprise Query Client Configuration
 * Master dev settings: 60s staleTime, no aggressive refetch on window focus to avoid factory dashboard flicker
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30, // 30 seconds
      gcTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export const QueryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};

