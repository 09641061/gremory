import type { CSSProperties, ReactNode } from "react";
import { Suspense } from "react";
import { cookies, headers } from "next/headers";

import { iamSessionCookies } from "@/contexts/iam/infrastructure/session/iam-session-cookie";
import { createPlanHomeRouteQueryService } from "@/contexts/shared/application/internal/queryservices/plan-home-route-query.service";
import { createBusinessWorkspaceQueryService } from "@/contexts/business/application/internal/queryservices/business-workspace-query.service";
import { hasSomewhereToCancelTo } from "@/contexts/business/domain/services/workspace-navigation.policy";
import { BackNavigationButton } from "@/contexts/shared/interfaces/components/back-navigation-button";

/**
 * Establishments, organization and permissions.
 *
 * These are settings reached from the app and left again, so the back arrow is
 * their only chrome, exactly as on `/upgrade`. It streams behind its own
 * boundary so resolving the plan never delays the page underneath it.
 */
export default function ConfigurationLayout({ children }: { children: ReactNode }) {
  return (
    <main
      className="flex min-w-0 flex-1 flex-col p-6"
      // The back bar takes room the app routes do not spend, so the columns
      // that size themselves against the viewport have to discount it too.
      style={{ "--app-page-viewport-height": "calc(100vh - 9.5rem)" } as CSSProperties}
    >
      <div className="mb-4 flex h-8 items-center">
        <Suspense fallback={null}>
          <BackToHomeLink />
        </Suspense>
      </div>

      {children}
    </main>
  );
}

async function BackToHomeLink() {
  // Read outside any cached scope: the session is per-request.
  const accessToken = (await cookies()).get(iamSessionCookies.accessToken)?.value;
  const establishmentId = (await headers()).get("x-takodu-establishment-id") ?? undefined;

  // Every other screen under this layout is only reachable once onboarding is
  // complete (the guard restricts `/organizations/new` and `/establishments/new`
  // to exactly that mandatory, nowhere-to-go-back-to state), so this same check
  // naturally covers the whole group: it only ever hides the arrow on those two.
  const workspace = await createBusinessWorkspaceQueryService()
    .getHeaderViewModel({ establishmentId })
    .catch(() => null);
  if (
    workspace &&
    !hasSomewhereToCancelTo(workspace.establishments, workspace.organization?.id, workspace.onboardingCompleted)
  ) {
    return null;
  }

  const href = await createPlanHomeRouteQueryService().handle({ accessToken, establishmentId });

  return <BackNavigationButton fallbackHref={href} />;
}
