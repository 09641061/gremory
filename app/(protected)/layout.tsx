import type { ReactNode } from "react";

import { ErrorBanner } from "@/contexts/shared/interfaces/components/error-banner";

/**
 * Shared surface for authenticated routes. Welcome has a header-only shell;
 * work, onboarding and terminal account-state routes include navigation.
 * Configuration and billing keep their focused layouts.
 */
export default function ProtectedLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-svh w-full flex-col bg-background text-foreground">
      {children}
      <ErrorBanner />
    </div>
  );
}
