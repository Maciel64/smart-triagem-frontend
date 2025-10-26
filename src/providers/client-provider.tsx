"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const query = new QueryClient();

export function ClientProvider({ children }: { children: React.ReactNode }) {
  return <QueryClientProvider client={query}>{children}</QueryClientProvider>;
}
