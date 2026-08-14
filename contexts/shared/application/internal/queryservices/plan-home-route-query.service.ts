import "server-only";

import { createCurrentSubscriptionQueryService } from "@/contexts/billing/application/internal/queryservices/current-subscription-query.service";
import { createAppShellQueryService } from "@/contexts/shared/application/internal/queryservices/app-shell-query.service";
import type { AppShellHomeHref } from "@/contexts/shared/application/model/app-shell.view-models";

export type PlanHomeRouteQuery = Readonly<{
  accessToken?: string;
  establishmentId?: string;
}>;

/**
 * `/login` when there is no session, and `/` when the plan cannot be resolved:
 * that is the one route the proxy turns into the right home on the next request.
 */
export type PlanHomeRoute = AppShellHomeHref | "/login" | "/";

/**
 * Where a screen rendered outside the sidebar sends the user back to.
 *
 * The destination is the plan's home route, the same one the shell derives, so
 * the user always lands on a page their subscription can actually open.
 */
export class PlanHomeRouteQueryService {
  async handle({ accessToken, establishmentId }: PlanHomeRouteQuery): Promise<PlanHomeRoute> {
    if (!accessToken) return "/login";

    const subscription =
      await createCurrentSubscriptionQueryService().getCurrentSubscriptionSnapshot(accessToken);

    const shell = await createAppShellQueryService()
      .resolve({ subscription, workspace: { establishmentId } })
      .catch(() => null);

    return shell?.homeHref ?? "/";
  }
}

export function createPlanHomeRouteQueryService() {
  return new PlanHomeRouteQueryService();
}
