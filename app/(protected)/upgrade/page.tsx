import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

import { SubscribeView } from "@/contexts/billing/interfaces/components/subscribe/subscribe-view";
import { createCurrentSubscriptionQueryService } from "@/contexts/billing/application/internal/queryservices/current-subscription-query.service";
import { listPlansByCurrencyQueryService } from "@/contexts/billing/application/internal/queryservices/list-plans-query.service";
import { createAppShellQueryService } from "@/contexts/shared/application/internal/queryservices/app-shell-query.service";
import { createBusinessWorkspaceQueryService } from "@/contexts/business/application/internal/queryservices/business-workspace-query.service";
import { iamSessionCookies } from "@/contexts/iam/infrastructure/session/iam-session-cookie";

export default async function UpgradePage() {
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

  if (workspace?.accessPolicy?.canManageBilling === false) {
    redirect(shell?.homeHref ?? "/access-denied");
  }

  const subscription = accessToken
    ? await createCurrentSubscriptionQueryService().getCurrentSubscriptionSnapshot(accessToken)
    : null;

  return (
    <SubscribeView
      backHref={shell?.homeHref ?? "/access-denied"}
      plansByCurrency={await listPlansByCurrencyQueryService()}
      currentSubscription={subscription}
    />
  );
}
