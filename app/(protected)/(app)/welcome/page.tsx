import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { createCurrentSubscriptionQueryService } from "@/contexts/billing/application/internal/queryservices/current-subscription-query.service";
import { createAppShellQueryService } from "@/contexts/shared/application/internal/queryservices/app-shell-query.service";
import { createBusinessWorkspaceQueryService } from "@/contexts/business/application/internal/queryservices/business-workspace-query.service";
import { iamSessionCookies } from "@/contexts/iam/infrastructure/session/iam-session-cookie";

export default async function WelcomePage() {
  const accessToken = (await cookies()).get(iamSessionCookies.accessToken)?.value;
  if (accessToken) {
    const [workspace, subscription] = await Promise.all([
      createBusinessWorkspaceQueryService().getHeaderViewModel().catch(() => null),
      createCurrentSubscriptionQueryService().getCurrentSubscriptionSnapshot(accessToken),
    ]);

    if (subscription?.active === true) {
      if (!workspace?.organization) {
        redirect("/organizations/new");
      }

      const shell = await createAppShellQueryService()
        .resolve()
        .catch(() => null);
      redirect(shell?.homeHref ?? "/");
    }
  }

  return (
    <div className="flex h-full items-center justify-center bg-background text-foreground">
      <div className="space-y-2 text-center">
        <h1 className="text-4xl font-semibold tracking-tight">Welcome</h1>
        <p className="text-muted-foreground">Configure your account to get started</p>
      </div>
    </div>
  );
}
