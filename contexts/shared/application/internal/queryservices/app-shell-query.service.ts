import "server-only";

import { createBusinessWorkspaceQueryService } from "@/contexts/business/application/internal/queryservices/business-workspace-query.service";
import { createSubscriptionAccessQueryService } from "@/contexts/billing/application/internal/queryservices/subscription-access-query.service";
import { createCatalogAccessPolicyService } from "@/contexts/catalog/application/internal/queryservices/catalog-access-policy.service";
import { createCrmAccessPolicyService } from "@/contexts/crm/application/internal/queryservices/crm-access-policy.service";
import { createSchedulingAccessPolicyService } from "@/contexts/scheduling/application/internal/queryservices/scheduling-access-policy.service";
import { createWorkforceAccessPolicyService } from "@/contexts/workforce/application/internal/queryservices/workforce-access-policy.service";
import type { SubscriptionAccessSnapshot } from "@/contexts/billing/domain/services/subscription-access.policy";
import type {
  AppShellHomeHref,
  AppShellViewModel,
  SidebarRouteId,
} from "@/contexts/shared/application/model/app-shell.view-models";

export interface AppShellQueryInput {
  subscription: SubscriptionAccessSnapshot | null | undefined;
  workspace?: Readonly<{
    establishmentId?: string;
  }>;
}

export class AppShellQueryService {
  async resolve({ subscription, workspace: workspaceSelection }: AppShellQueryInput): Promise<AppShellViewModel> {
    const subscriptionAccess = createSubscriptionAccessQueryService().resolve(subscription);
    const workspace = await createBusinessWorkspaceQueryService().getHeaderViewModel(workspaceSelection);
    const activeEstablishmentId = workspace.activeEstablishmentId;
    const isOwnerWorkspace = workspace.accountType === "OWNER";
    const [schedulingPermissions, catalogPermissions, crmPermissions, workforcePermissions] =
      activeEstablishmentId
        ? await Promise.all([
            createSchedulingAccessPolicyService().getPermissions(activeEstablishmentId),
            createCatalogAccessPolicyService().getPermissions(activeEstablishmentId),
            createCrmAccessPolicyService().getPermissions(activeEstablishmentId),
            createWorkforceAccessPolicyService().getPermissions(activeEstablishmentId),
          ])
        : [null, null, null, null];
    const capabilities = workspace.capabilities;
    const canReadScheduling =
      capabilities?.canReadAppointments ?? schedulingPermissions?.canReadAppointments ?? isOwnerWorkspace;
    const canReadCatalog =
      capabilities?.canReadCatalog ?? catalogPermissions?.canReadCatalog ?? isOwnerWorkspace;
    const canReadCrm =
      capabilities?.canReadCustomers ?? crmPermissions?.canReadCustomers ?? isOwnerWorkspace;
    const canReadTeam =
      capabilities?.canReadTeam ?? workforcePermissions?.canReadTeam ?? isOwnerWorkspace;
    const canReadAnalytics = capabilities?.canReadAnalytics ?? true;
    const visibleSidebarRoutes = resolveVisibleSidebarRoutes(
      canReadScheduling,
      canReadCatalog,
      canReadCrm,
      canReadTeam,
      canReadAnalytics,
      subscriptionAccess.hasAssistantAccess,
    );

    return {
      workspace,
      hasAssistantAccess: subscriptionAccess.hasAssistantAccess,
      homeHref: resolveHomeHref(subscriptionAccess.hasAssistantAccess, visibleSidebarRoutes, workspace),
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
  canReadAnalytics: boolean,
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
  if (canReadAnalytics) {
    routes.push("/analytics");
  }

  return routes;
}

function resolveHomeHref(
  hasAssistantAccess: boolean,
  visibleRoutes: ReadonlyArray<SidebarRouteId>,
  workspace: AppShellViewModel["workspace"],
): AppShellHomeHref {
  // An account that registered through an invitation belongs nowhere until it
  // accepts, so it is sent to the acceptance screen instead of an empty shell.
  if (workspace.accountType === "PENDING_INVITATION") {
    return "/invitations/pending";
  }
  if (workspace.organization && workspace.establishments.length === 0 && workspace.canCreateEstablishment) {
    return "/establishments/new";
  }
  if (hasAssistantAccess) {
    return "/chat";
  }

  const firstWorkRoute = visibleRoutes.find((route) => route !== "/analytics");
  if (firstWorkRoute) return firstWorkRoute;

  if (workspace.canReadOrganization) return "/organization";
  return "/access-denied";
}
