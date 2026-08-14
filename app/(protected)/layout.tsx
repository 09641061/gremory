import type { ReactNode } from "react";

import { ErrorBanner } from "@/contexts/shared/interfaces/components/error-banner";

/**
 * Shell for every authenticated route.
 *
 * It carries only what all of them share — the surface and the permission
 * banner. The sidebar belongs to the `(app)` group alone, since the
 * configuration screens and `/upgrade` navigate through their own back link.
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
