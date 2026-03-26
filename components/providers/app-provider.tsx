"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "sonner";
import { AppProgressProvider as ProgressProvider } from "@bprogress/next";
import { TooltipProvider } from "@/components/ui/tooltip";

export default function AppProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const queryClient = new QueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <ProgressProvider>
        <TooltipProvider>{children}</TooltipProvider>
        <Toaster richColors position="top-right" closeButton />
        <ReactQueryDevtools initialIsOpen={false} />
      </ProgressProvider>
    </QueryClientProvider>
  );
}
