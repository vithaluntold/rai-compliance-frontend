"use client";

import dynamic from "next/dynamic";
import ErrorBoundary from "@/components/error-boundary";
import FinACEverseFooter from "@/components/finaceverse-footer";
import { LoadingProvider } from "@/contexts/loading-context";
import { GlobalLoadingIndicator, NetworkStatusIndicator } from "@/components/ui/loading-indicators";
import { Toaster } from "@/components/ui/toaster";

// Dynamically import the theme provider to prevent SSR issues
const DynamicCustomThemeProvider = dynamic(
  () => import("@/context/theme-context").then((mod) => ({ default: mod.CustomThemeProvider })),
  {
    loading: () => <div style={{ visibility: 'hidden' }}>Loading...</div>,
  }
);

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <ErrorBoundary>
      <DynamicCustomThemeProvider>
        <LoadingProvider>
          {children}
          <GlobalLoadingIndicator />
          <NetworkStatusIndicator />
          <FinACEverseFooter />
          <Toaster />
        </LoadingProvider>
      </DynamicCustomThemeProvider>
    </ErrorBoundary>
  );
}