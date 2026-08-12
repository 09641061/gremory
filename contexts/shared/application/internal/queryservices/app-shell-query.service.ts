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
  workspace?: Readonly<{
    organizationId?: string;
    establishmentId?: string;
  }>;
}

export class AppShellQueryService {
  async resolve({ subscription, workspace: workspaceSelection }: AppShellQueryInput): Promise<AppShellViewModel> {
    const subscriptionAccess = createSubscriptionAccessQueryService().resolve(subscription);
    const workspace = await createBusinessWorkspaceQueryService().getHeaderViewModel(workspaceSelection);
    const activeEstablishmentId = workspace.activeEstablishmentId;
    const [schedulingPermissions, catalogPermissions, crmPermissions, workforcePermissions] =
      activeEstablishmentId
        ? await Promise.all([
            createSchedulingAccessPolicyService().getPermissions(activeEstablishmentId),
            createCatalogAccessPolicyService().getPermissions(activeEstablishmentId),
            createCrmAccessPolicyService().getPermissions(activeEstablishmentId),
            createWorkforceAccessPolicyService().getPermissions(activeEstablishmentId),
          ])
        : [null, null, null, null];
    const visibleSidebarRoutes = resolveVisibleSidebarRoutes(
      schedulingPermissions?.canReadAppointments ?? false,
      catalogPermissions?.canReadCatalog ?? false,
      crmPermissions?.canReadCustomers ?? false,
      workforcePermissions?.canReadTeam ?? false,
      subscriptionAccess.hasAssistantAccess,
    );

    return {
      workspace,
      hasAssistantAccess: subscriptionAccess.hasAssistantAccess,
      homeHref: resolveHomeHref(subscriptionAccess.hasAssistantAccess, visibleSidebarRoutes, workspace),
      visibleSidebarRoutes,
      headerNavigation: {
        organizationListHref: workspace.canReadOrganizations ? "/organizations" : null,
        newOrganizationHref: workspace.canCreateOrganization ? "/organizations/new" : null,
      },
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
  routes.push("/audit-log");

  return routes;
}

function resolveHomeHref(
  hasAssistantAccess: boolean,
  visibleRoutes: ReadonlyArray<SidebarRouteId>,
  workspace: AppShellViewModel["workspace"],
): "/chat" | "/schedule" | "/crm" | "/catalog" | "/team" | "/organizations" | "/establishments/new" | "/access-denied" {
  if (workspace.organization && workspace.establishments.length === 0 && workspace.canCreateEstablishment) {
    return "/establishments/new";
  }
  if (hasAssistantAccess) {
    return "/chat";
  }

  const firstWorkRoute = visibleRoutes.find((route) => route !== "/analytics" && route !== "/audit-log");
  if (firstWorkRoute) return firstWorkRoute;

  if (workspace.organization?.canRead) return "/organizations";
  if (!workspace.organization && workspace.organizations.length === 0) return "/organizations";
  return "/access-denied";
}
