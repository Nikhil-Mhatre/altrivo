"use client";

import { Toaster } from "@altrivo/ui-library";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import React, { PropsWithChildren, useState } from "react";

export function Providers({ children }: PropsWithChildren) {
  // Make sure the client only gets created once
  const [queryClient] = useState(() => new QueryClient());
  return (
    <>
      <Toaster position="top-right"/>
      <QueryClientProvider client={queryClient}>
        {children}
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </>
  );
}
