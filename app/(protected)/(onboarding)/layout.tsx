import type { ReactNode } from "react";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

import { iamSessionCookies } from "@/contexts/iam/infrastructure/session/iam-session-cookie";
import { createEntryRouteQueryService } from "@/contexts/shared/application/internal/queryservices/entry-route-query.service";
import { getServerDictionary } from "@/contexts/shared/infrastructure/i18n/server";
import { EntryRouteUnavailable } from "@/contexts/shared/interfaces/components/entry-route-unavailable";
import ProtectedAppShell from "@/contexts/shared/interfaces/components/protected-app-shell";

/**
 * Onboarding keeps the application sidebar so account-level controls remain
 * available. The entry guard still prevents opening workspace modules before
 * the required setup is complete.
 */
export default async function OnboardingLayout({ children }: { children: ReactNode }) {
  const accessToken = (await cookies()).get(iamSessionCookies.accessToken)?.value;
  if (!accessToken) redirect("/login");

  const requestHeaders = await headers();
  const pathname =
    requestHeaders.get("x-takodu-pathname") ?? requestHeaders.get("x-invoke-path") ?? "";
  const landing = await createEntryRouteQueryService()
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
      <EntryRouteUnavailable
        title={dictionary.onboarding.serviceUnavailableTitle}
        description={dictionary.onboarding.unavailableDescription}
        retryLabel={dictionary.onboarding.retry}
      />
    );
  }

  return <ProtectedAppShell>{children}</ProtectedAppShell>;
}
