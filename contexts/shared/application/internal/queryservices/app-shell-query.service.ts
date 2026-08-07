import "server-only";

import { createBusinessWorkspaceQueryService } from "@/contexts/business/application/internal/queryservices/business-workspace-query.service";
import { createSubscriptionAccessQueryService } from "@/contexts/billing/application/internal/queryservices/subscription-access-query.service";
import { createCatalogAccessPolicyService } from "@/contexts/catalog/application/internal/queryservices/catalog-access-policy.service";
import { createCrmAccessPolicyService } from "@/contexts/crm/application/internal/queryservices/crm-access-policy.service";
import { createSchedulingAccessPolicyService } from "@/contexts/scheduling/application/internal/queryservices/scheduling-access-policy.service";
import { createWorkforceAccessPolicyService } from "@/contexts/workforce/application/internal/queryservices/workforce-access-policy.service";
import type { SubscriptionAccessSnapshot } from "@/contexts/billing/domain/services/subscription-access.policy";
import type {
  AppShellViewModel,
  SidebarRouteId,
} from "@/contexts/shared/application/model/app-shell.view-models";

export interface AppShellQueryInput {
  subscription: SubscriptionAccessSnapshot | null | undefined;
}

export class AppShellQueryService {
  async resolve({ subscription }: AppShellQueryInput): Promise<AppShellViewModel> {
    const subscriptionAccess = createSubscriptionAccessQueryService().resolve(subscription);
    const workspace = await createBusinessWorkspaceQueryService().getHeaderViewModel();
    const [schedulingEstablishmentId, catalogEstablishmentId, crmEstablishmentId, teamEstablishmentId] =
      await Promise.all([
        createSchedulingAccessPolicyService().getDefaultEstablishmentId(),
        createCatalogAccessPolicyService().getDefaultEstablishmentId(),
        createCrmAccessPolicyService().getDefaultEstablishmentId(),
        createWorkforceAccessPolicyService().getDefaultEstablishmentId(),
      ]);
    const visibleSidebarRoutes = resolveVisibleSidebarRoutes(
      Boolean(schedulingEstablishmentId),
      Boolean(catalogEstablishmentId),
      Boolean(crmEstablishmentId),
      Boolean(teamEstablishmentId),
      subscriptionAccess.hasAssistantAccess,
    );

    return {
      workspace,
      hasAssistantAccess: subscriptionAccess.hasAssistantAccess,
      homeHref: resolveHomeHref(subscriptionAccess.hasAssistantAccess, visibleSidebarRoutes),
      visibleSidebarRoutes,
    };
  }
}

export function createAppShellQueryService() {
  return new AppShellQueryService();
}

function resolveVisibleSidebarRoutes(
  canReadScheduling: boolean,
  canReadCatalog: boolean,
  canReadCrm: boolean,
  canReadTeam: boolean,
  hasAssistantAccess: boolean,
): ReadonlyArray<SidebarRouteId> {
  const routes: SidebarRouteId[] = [];

  if (hasAssistantAccess) {
    routes.push("/chat");
  }
  if (canReadScheduling) {
    routes.push("/schedule");
  }
  if (canReadCrm) {
    routes.push("/crm");
  }
  if (canReadCatalog) {
    routes.push("/catalog");
  }
  if (canReadTeam) {
    routes.push("/team");
  }
  routes.push("/analytics");

  return routes;
}

function resolveHomeHref(
  hasAssistantAccess: boolean,
  visibleRoutes: ReadonlyArray<SidebarRouteId>,
): "/chat" | "/schedule" | "/crm" | "/catalog" | "/team" | "/organizations" {
  if (hasAssistantAccess) {
    return "/chat";
  }

  const firstWorkRoute = visibleRoutes.find((route) => route !== "/analytics");
  return firstWorkRoute ?? "/organizations";
}
