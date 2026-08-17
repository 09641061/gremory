import type { ReactNode } from "react";

import ProtectedAppShell from "@/contexts/shared/interfaces/components/protected-app-shell";

/**
 * Shell for the work routes, the only ones the sidebar navigates between.
 *
 * Configuration screens and `/upgrade` are entered from here and leave through
 * their own back link, so they render outside this group: a sidebar there would
 * be a second, competing way out.
 *
 * The sidebar streams behind its own boundary so the workspace lookup never
 * delays the page underneath it.
 */
export default function AppLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <ProtectedAppShell>{children}</ProtectedAppShell>;
}
