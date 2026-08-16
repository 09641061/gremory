import "server-only";

import { createBusinessWorkspaceQueryService } from "@/contexts/business/application/internal/queryservices/business-workspace-query.service";
import type {
  AppShellHomeHref,
  AppShellViewModel,
  SidebarRouteId,
} from "@/contexts/shared/application/model/app-shell.view-models";

export interface AppShellQueryInput {
  workspace?: Readonly<{
    establishmentId?: string;
  }>;
}

export class AppShellQueryService {
  async resolve({ workspace: workspaceSelection }: AppShellQueryInput = {}): Promise<AppShellViewModel> {
    const workspace = await createBusinessWorkspaceQueryService().getHeaderViewModel(workspaceSelection);
    const activeEstablishmentId = workspace.activeEstablishmentId;
    const accessPolicy = workspace.accessPolicy;
    const hasAssistantAccess = accessPolicy?.canUseAssistant ?? false;
    const canReadScheduling =
      accessPolicy?.canOpenScheduling ?? workspace.capabilities?.canReadAppointments ?? false;
    const canReadCatalog =
      accessPolicy?.canOpenCatalog ?? workspace.capabilities?.canReadCatalog ?? false;
    const canReadCrm =
      accessPolicy?.canOpenCrm ?? workspace.capabilities?.canReadCustomers ?? false;
    const canReadTeam =
      accessPolicy?.canOpenTeam ?? workspace.capabilities?.canReadTeam ?? false;
    const canReadAnalytics =
      accessPolicy?.canOpenAnalytics ?? workspace.capabilities?.canReadAnalytics ?? false;
    const visibleSidebarRoutes = resolveVisibleSidebarRoutes(
      canReadScheduling,
      canReadCatalog,
      canReadCrm,
      canReadTeam,
      canReadAnalytics,
      hasAssistantAccess,
    );

    return {
      workspace,
      hasAssistantAccess,
      homeHref: resolveHomeHref(hasAssistantAccess, visibleSidebarRoutes, workspace),
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
  if (
    workspace.organization &&
    workspace.establishments.length === 0 &&
    (workspace.accessPolicy?.canCreateEstablishment ?? workspace.canCreateEstablishment)
  ) {
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
