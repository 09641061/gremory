import { Suspense } from "react";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

import { SubscribeView } from "@/contexts/billing/interfaces/components/subscribe/subscribe-view";
import { createCurrentSubscriptionQueryService } from "@/contexts/billing/application/internal/queryservices/current-subscription-query.service";
import { listPlansByCurrencyQueryService } from "@/contexts/billing/application/internal/queryservices/list-plans-query.service";
import { createAppShellQueryService } from "@/contexts/shared/application/internal/queryservices/app-shell-query.service";
import { createBusinessWorkspaceQueryService } from "@/contexts/business/application/internal/queryservices/business-workspace-query.service";
import { iamSessionCookies } from "@/contexts/iam/infrastructure/session/iam-session-cookie";
import { PageLoading } from "@/contexts/shared/interfaces/components/page-loading";

/**
 * Keep the route shell instant-renderable while request-bound billing data is
 * resolved in its own Suspense subtree.
 */
export default function UpgradePage() {
  return (
    <Suspense fallback={<PageLoading />}>
      <UpgradePageContent />
    </Suspense>
  );
}

async function UpgradePageContent() {
  // Read outside any cached scope: the session is per-request.
  const accessToken = (await cookies()).get(iamSessionCookies.accessToken)?.value;
  const requestHeaders = await headers();
  const establishmentId = requestHeaders.get("x-takodu-establishment-id") ?? undefined;
  const workspace = accessToken
    ? await createBusinessWorkspaceQueryService().getHeaderViewModel({ establishmentId }).catch(() => null)
    : null;

  const shell = accessToken
    ? await createAppShellQueryService()
        .resolve({ workspace: { establishmentId } })
        .catch(() => null)
    : null;

  // Only redirect if user has explicit deny for billing management
  // (not just when they're in onboarding without org yet)
  if (workspace?.accessPolicy?.canManageBilling === false) {
    // If they have an org but can't manage billing, redirect
    if (workspace.organization) {
      redirect(shell?.homeHref ?? "/access-denied");
    }
    // If no org yet (onboarding), allow access to upgrade page
    // but don't require subscription data
  }

  const subscription = accessToken && workspace?.organization
    ? await createCurrentSubscriptionQueryService().getCurrentSubscriptionSnapshot(accessToken)
    : null;

  return (
    <SubscribeView
      backHref={workspace?.organization ? (shell?.homeHref ?? "/welcome") : "/welcome"}
      plansByCurrency={await listPlansByCurrencyQueryService()}
      currentSubscription={subscription}
    />
  );
}
