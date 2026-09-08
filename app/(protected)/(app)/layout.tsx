import type { ReactNode } from "react";
import { Suspense } from "react";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import ProtectedAppShell from "@/contexts/shared/interfaces/components/protected-app-shell";
import { PageLoading } from "@/contexts/shared/interfaces/components/page-loading";
import { iamSessionCookies } from "@/contexts/iam/infrastructure/session/iam-session-cookie";
import { workspaceSelectionCookies } from "@/contexts/business/infrastructure/session/workspace-selection-cookie";
import { createEntryRouteQueryService } from "@/contexts/shared/application/internal/queryservices/entry-route-query.service";
import { getServerDictionary } from "@/contexts/shared/infrastructure/i18n/server";
import { EntryRouteUnavailable } from "@/contexts/shared/interfaces/components/entry-route-unavailable";

/**
 * Shell for work routes. Welcome has a separate header-only route group.
 *
 * Configuration screens and `/upgrade` are entered from here and leave through
 * their own back link, so they render outside this group: a sidebar there would
 * be a second, competing way out.
 *
 * The sidebar streams behind its own boundary so the workspace lookup never
 * delays the page underneath it. This layout also wraps every entry-guard read
 * (cookies, headers, entry-route resolution, server dictionary) in a Suspense
 * subtree so the App Shell can render instantly under Cache Components
 * (`blocking-prerender-dynamic`).
 */
export default function AppLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <Suspense fallback={<PageLoading />}>
      <AppLayoutContent>{children}</AppLayoutContent>
    </Suspense>
  );
}

async function AppLayoutContent({
  children,
}: {
  children: ReactNode;
}) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(iamSessionCookies.accessToken)?.value;
  if (!accessToken) redirect("/login");

  const requestHeaders = await headers();
  const establishmentId = requestHeaders.get("x-takodu-establishment-id") ?? undefined;
  const organizationId = cookieStore.get(workspaceSelectionCookies.organizationId)?.value ?? undefined;
  const landing = await createEntryRouteQueryService()
    .resolveRoute({ accessToken, organizationId, establishmentId })
    .catch(() => ({ status: "unavailable" as const }));

  // Proxy is the fast path. This server-side backstop protects client
  // transitions and stale pages from entering the application shell before
  // subscription and workspace onboarding are complete.
  if (landing.status === "unauthenticated") redirect("/login");
  if (
    landing.status === "subscription-required" ||
    landing.status === "invitation-pending" ||
    landing.status === "organization-required" ||
    landing.status === "establishment-required"
  ) {
    redirect(landing.setupHref);
  }
  if (landing.status === "unavailable") {
    const dictionary = await getServerDictionary();
    return (
      <ProtectedAppShell>
        <EntryRouteUnavailable
          title={dictionary.onboarding.serviceUnavailableTitle}
          description={dictionary.onboarding.unavailableDescription}
          retryLabel={dictionary.onboarding.retry}
        />
      </ProtectedAppShell>
    );
  }

  return <ProtectedAppShell>{children}</ProtectedAppShell>;
}
