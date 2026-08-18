import "server-only";

import { createBusinessWorkspaceQueryService } from "@/contexts/business/application/internal/queryservices/business-workspace-query.service";
import type {
  AppShellHomeHref,
  AppShellViewModel,
  SidebarRouteId,
} from "@/contexts/shared/application/model/app-shell.view-models";

export interface AppShellQueryInput {
  workspace?: Readonly<{
    organizationId?: string;
    establishmentId?: string;
  }>;
}

export class AppShellQueryService {
  async resolve({ workspace: workspaceSelection }: AppShellQueryInput = {}): Promise<AppShellViewModel> {
    const workspace = await createBusinessWorkspaceQueryService().getHeaderViewModel(workspaceSelection);
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
  if (workspace.accountType === "PENDING_INVITATION" || workspace.onboardingStatus === "ORGANIZATION_PENDING") {
    // An account that registered through an invitation belongs nowhere until it
    // accepts. A new owner needs to create its organization before entering the
    // application shell.
    if (workspace.accountType === "PENDING_INVITATION") return "/invitations/pending";
    return "/organizations/new";
  }
  if (workspace.onboardingStatus === "ESTABLISHMENT_PENDING") {
    return "/establishments/new";
  }
  // Keep the legacy fallback only for workspace responses that predate the
  // onboarding status contract. Once the backend sends a status, that status
  // is the source of truth.
  if (
    workspace.onboardingStatus == null &&
    workspace.accountType === "OWNER" &&
    workspace.organization &&
    workspace.establishments.length === 0 &&
    workspace.canCreateEstablishment
  ) {
    return "/establishments/new";
  }
  if (!workspace.organization) {
    return "/access-denied";
  }
  if (hasAssistantAccess) {
    return "/chat";
  }

  const firstWorkRoute = visibleRoutes.find((route) => route !== "/analytics");
  if (firstWorkRoute) return firstWorkRoute;

  if (workspace.accountType === "OWNER") return "/welcome";
  // No module is openable, but the account may still manage an establishment
  // profile (`establishment:update`), which lives on the establishments page.
  if (
    workspace.canReadEstablishments &&
    workspace.establishments.some((establishment) => establishment.canUpdate === true)
  ) {
    return "/establishments";
  }
  return "/access-denied";
}
