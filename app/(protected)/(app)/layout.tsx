import type { ReactNode } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import ProtectedAppShell from "@/contexts/shared/interfaces/components/protected-app-shell";
import { createBusinessWorkspaceQueryService } from "@/contexts/business/application/internal/queryservices/business-workspace-query.service";

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
export default async function AppLayout({
  children,
}: {
  children: ReactNode;
}) {
  const establishmentId = (await headers()).get("x-takodu-establishment-id") ?? undefined;
  const workspace = await createBusinessWorkspaceQueryService()
    .getHeaderViewModel({ establishmentId })
    .catch(() => null);

  // An organization cannot enter the application shell until its first
  // establishment exists. Keep this guard here as a server-side backstop in
  // addition to proxy.ts, so stale client navigation cannot bypass onboarding.
  if (
    workspace?.accountType === "OWNER" &&
    workspace.organization &&
    workspace.establishments.length === 0
  ) {
    redirect(`/establishments/new?organizationId=${encodeURIComponent(workspace.organization.id)}`);
  }

  return <ProtectedAppShell>{children}</ProtectedAppShell>;
}
