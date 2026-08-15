import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

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
            establishmentId: requestHeaders.get("x-takodu-establishment-id") ?? undefined,
          },
        })
        .catch(() => null)
    : null;

  // Billing is shown only when the workspace policy allows it; this route must
  // not rely on role inference or on the subscription snapshot alone.
  if (shell && shell.workspace.accessPolicy?.canManageBilling === false) {
    redirect(shell.homeHref);
  }

  return (
    <SubscribeView
      backHref={shell?.homeHref ?? "/access-denied"}
      plansByCurrency={await listPlansByCurrencyQueryService()}
      currentSubscription={subscription}
    />
  );
}
