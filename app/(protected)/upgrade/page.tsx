import { cookies, headers } from "next/headers";

import { SubscribeView } from "@/contexts/billing/interfaces/components/subscribe/subscribe-view";
import { createCurrentSubscriptionQueryService } from "@/contexts/billing/application/internal/queryservices/current-subscription-query.service";
import { listPlansByCurrencyQueryService } from "@/contexts/billing/application/internal/queryservices/list-plans-query.service";
import { createAppShellQueryService } from "@/contexts/shared/application/internal/queryservices/app-shell-query.service";
import { iamSessionCookies } from "@/contexts/iam/infrastructure/session/iam-session-cookie";

export default async function UpgradePage() {
  // Read outside any cached scope: the session is per-request.
  const accessToken = (await cookies()).get(iamSessionCookies.accessToken)?.value;
  const requestHeaders = await headers();

  const subscription = accessToken
    ? await createCurrentSubscriptionQueryService().getCurrentSubscriptionSnapshot(accessToken)
    : null;

  // The shell already derives the plan's home route (`/chat` with assistant
  // access, otherwise the first work route), which is where "back" belongs.
  const shell = accessToken
    ? await createAppShellQueryService()
        .resolve({
          subscription,
          workspace: {
            organizationId: requestHeaders.get("x-takodu-organization-id") ?? undefined,
            establishmentId: requestHeaders.get("x-takodu-establishment-id") ?? undefined,
          },
        })
        .catch(() => null)
    : null;

  return (
    <SubscribeView
      backHref={shell?.homeHref ?? "/organizations"}
      plansByCurrency={await listPlansByCurrencyQueryService()}
    />
  );
}
