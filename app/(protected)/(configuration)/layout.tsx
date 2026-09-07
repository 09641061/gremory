import type { CSSProperties, ReactNode } from "react";
import { Suspense } from "react";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

import { iamSessionCookies } from "@/contexts/iam/infrastructure/session/iam-session-cookie";
import { workspaceSelectionCookies } from "@/contexts/business/infrastructure/session/workspace-selection-cookie";
import { createEntryRouteQueryService } from "@/contexts/shared/application/internal/queryservices/entry-route-query.service";
import { getServerDictionary } from "@/contexts/shared/infrastructure/i18n/server";
import { EntryRouteUnavailable } from "@/contexts/shared/interfaces/components/entry-route-unavailable";
import { createPlanHomeRouteQueryService } from "@/contexts/shared/application/internal/queryservices/plan-home-route-query.service";
import { createBusinessWorkspaceQueryService } from "@/contexts/business/application/internal/queryservices/business-workspace-query.service";
import { hasSomewhereToCancelTo } from "@/contexts/business/domain/services/workspace-navigation.policy";
import { BackNavigationButton } from "@/contexts/shared/interfaces/components/back-navigation-button";

/**
 * Establishments, organization settings and permissions. One-time
 * organization creation lives in the onboarding route group instead.
 *
 * These are settings reached from the app and left again, so the back arrow is
 * their only chrome, exactly as on `/upgrade`. It streams behind its own
 * boundary so resolving the plan never delays the page underneath it.
 */
export default async function ConfigurationLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(iamSessionCookies.accessToken)?.value;
  if (!accessToken) redirect("/login");

  const requestHeaders = await headers();
  const pathname =
    requestHeaders.get("x-takodu-pathname") ?? requestHeaders.get("x-invoke-path") ?? "";
  const landing = await createEntryRouteQueryService()
    .resolveRoute({
      accessToken,
      organizationId: cookieStore.get(workspaceSelectionCookies.organizationId)?.value ?? undefined,
      establishmentId: requestHeaders.get("x-takodu-establishment-id") ?? undefined,
    })
    .catch(() => ({ status: "unavailable" as const }));

  if (landing.status === "unauthenticated") redirect("/login");
  if (
    landing.status === "subscription-required" ||
    landing.status === "invitation-pending" ||
    landing.status === "organization-required" ||
    landing.status === "establishment-required"
  ) {
    if (!pathname || !landing.allowedPaths.includes(pathname)) {
      redirect(landing.setupHref);
    }
  }
  if (landing.status === "unavailable") {
    const dictionary = await getServerDictionary();
    return (
      <EntryRouteUnavailable
        title={dictionary.onboarding.serviceUnavailableTitle}
        description={dictionary.onboarding.unavailableDescription}
        retryLabel={dictionary.onboarding.retry}
      />
    );
  }

  return (
    <main
      className="flex min-w-0 flex-1 flex-col p-6"
      // The back bar takes room the app routes do not spend, so the columns
      // that size themselves against the viewport have to discount it too.
      style={{ "--app-page-viewport-height": "calc(100vh - 9.5rem)" } as CSSProperties}
    >
      <div className="absolute left-6 top-6 z-20 sm:left-8">
        <Suspense fallback={null}>
          <BackToHomeLink />
        </Suspense>
      </div>

      <div className="mb-4 h-8" aria-hidden="true" />

      {children}
    </main>
  );
}

async function BackToHomeLink() {
  const href = await resolveConfigurationBackHref();
  if (!href) return null;

  return <BackNavigationButton fallbackHref={href} />;
}

export async function resolveConfigurationBackHref() {
  // Read outside any cached scope: the session is per-request.
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(iamSessionCookies.accessToken)?.value;
  const requestHeaders = await headers();
  const establishmentId = requestHeaders.get("x-takodu-establishment-id") ?? undefined;
  const pathname =
    requestHeaders.get("x-takodu-pathname") ?? requestHeaders.get("x-invoke-path") ?? "";
  const organizationId = cookieStore.get(workspaceSelectionCookies.organizationId)?.value ?? undefined;
  const previewOrganizationId =
    cookieStore.get(workspaceSelectionCookies.previewOrganizationId)?.value ?? undefined;

  // Every other screen under this layout is only reachable once onboarding is
  // complete (the guard restricts `/establishments/new` to the mandatory,
  // nowhere-to-go-back-to state), so this same check
  // naturally covers the whole group: it only ever hides the arrow on the
  // mandatory first-establishment screen.
  const workspace = await createBusinessWorkspaceQueryService()
    .getHeaderViewModel({ establishmentId })
    .catch(() => null);
  // Mandatory onboarding screens have no valid destination to return to.
  // Other configuration pages, including `/profile`, must always expose the
  // same back button as `/upgrade`, even when the workspace has no
  // establishment yet.
  const isMandatoryOnboardingPath =
    pathname === "/establishments/new";
  if (
    isMandatoryOnboardingPath &&
    workspace &&
    !hasSomewhereToCancelTo(workspace.establishments, workspace.organization?.id, workspace.onboardingCompleted)
  ) {
    return null;
  }

  if (organizationId) {
    const href = new URL("/", "http://localhost");
    href.searchParams.set("organizationId", organizationId);
    if (establishmentId) {
      href.searchParams.set("establishmentId", establishmentId);
    } else if (previewOrganizationId && previewOrganizationId !== organizationId) {
      href.searchParams.set("previewOrganizationId", previewOrganizationId);
    }
    return `${href.pathname}${href.search}`;
  }

  return await createPlanHomeRouteQueryService().handle({ accessToken, establishmentId });
}
