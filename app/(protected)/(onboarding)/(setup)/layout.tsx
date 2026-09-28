import type { ReactNode } from "react";
import { Suspense } from "react";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

import { iamSessionCookies } from "@/contexts/iam/infrastructure/session/iam-session-cookie";
import { composeSharedAdapters } from "@/contexts/shared/interfaces/server/shared-composition";
import { getServerDictionary } from "@/contexts/shared/infrastructure/i18n/server";
import { EntryRouteUnavailable } from "@/contexts/shared/interfaces/components/feedback/entry-route-unavailable";
import { PageLoading } from "@/contexts/shared/interfaces/components/feedback/page-loading";
import ProtectedAppShell from "@/contexts/shared/interfaces/components/layout/protected-app-shell";

/**
 * Onboarding keeps the application sidebar so account-level controls remain
 * available. The entry guard still prevents opening workspace modules before
 * the required setup is complete.
 *
 * The entry-guard reads (cookies, headers, resolveRoute, server dictionary)
 * are wrapped in a Suspense subtree so the App Shell can render instantly
 * under Cache Components (`blocking-prerender-dynamic`).
 */
export default function OnboardingLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<PageLoading />}>
      <OnboardingLayoutContent>{children}</OnboardingLayoutContent>
    </Suspense>
  );
}

async function OnboardingLayoutContent({ children }: { children: ReactNode }) {
  const accessToken = (await cookies()).get(iamSessionCookies.accessToken)?.value;
  if (!accessToken) redirect("/login");

  const requestHeaders = await headers();
  const pathname =
    requestHeaders.get("x-takodu-pathname") ?? requestHeaders.get("x-invoke-path") ?? "";
  const landing = await composeSharedAdapters().entryRouteQueryService
    .resolveRoute({ accessToken })
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
