import type { AppShellHomeHref } from "@/contexts/shared/application/model/app-shell.view-models";
import type { AppShellQueryService } from "@/contexts/shared/application/internal/queryservices/app-shell-query.service";

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
  constructor(private readonly shell: AppShellQueryService) {}

  async handle({ accessToken, establishmentId }: PlanHomeRouteQuery): Promise<PlanHomeRoute> {
    if (!accessToken) return "/login";

    const shell = await this.shell
      .resolve({ workspace: { establishmentId }, accessToken })
      .catch(() => null);

    return shell?.homeHref ?? "/";
  }
}

export function createPlanHomeRouteQueryService(
  shell: AppShellQueryService,
): PlanHomeRouteQueryService {
  return new PlanHomeRouteQueryService(shell);
}
