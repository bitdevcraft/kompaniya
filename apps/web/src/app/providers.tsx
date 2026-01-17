"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

const queryClient = new QueryClient();

import type { ReactNode } from "react";

import { useEffect } from "react";

import { registerAllCustomComponents } from "@/lib/component-definitions/registrations";

interface ProvidersProps {
  children: ReactNode;
}

export const Providers = ({ children }: ProvidersProps) => {
  useEffect(() => {
    registerAllCustomComponents();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ReactQueryDevtools initialIsOpen={false} position="left" />
      {children}
    </QueryClientProvider>
  );
};
