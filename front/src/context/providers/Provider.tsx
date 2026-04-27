"use client";

import { ThemeProvider } from "@/hooks/useTheme";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { SkeletonTheme } from "react-loading-skeleton";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <GoogleOAuthProvider
          clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""}
        >
          <SkeletonTheme
            baseColor={"var(--secondary-bg)"}
            highlightColor={"var(--primary-bg"}
          >
            {children}
          </SkeletonTheme>
        </GoogleOAuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
