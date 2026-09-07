import "server-only";

import { hasActiveSubscription } from "@/contexts/billing/domain/services/subscription-access.policy";
import { createBusinessWorkspaceQueryService } from "@/contexts/business/application/internal/queryservices/business-workspace-query.service";
import type {
  AppShellHomeHref,
  AppShellViewModel,
  SidebarRouteId,
} from "@/contexts/shared/application/model/app-shell.view-models";
import type { EntryRouteSubscriptionState } from "@/contexts/shared/application/model/entry-route.view-models";
import { resolveEntryRoutePolicy } from "@/contexts/shared/application/services/entry-route.policy";

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

    const entry = resolveEntryRoutePolicy(workspace, resolveWorkspaceSubscriptionState(workspace));

    return {
      workspace,
      hasAssistantAccess,
      homeHref: resolveShellHomeHref(entry),
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

function resolveWorkspaceSubscriptionState(
  workspace: AppShellViewModel["workspace"],
): EntryRouteSubscriptionState {
  if (workspace.accountType !== "OWNER") return "not-required";
  return workspace.subscription && hasActiveSubscription(workspace.subscription)
    ? "active"
    : "inactive";
}

function resolveShellHomeHref(
  entry: ReturnType<typeof resolveEntryRoutePolicy>,
): AppShellHomeHref {
  if (entry.status === "ready") return entry.homeHref;
  if ("setupHref" in entry) return entry.setupHref;
  // An unavailable dependency is not a valid application destination. The
  // canonical root renders the retryable unavailable state; keeping the shell
  // fallback on welcome prevents a stale back link from opening a module.
  return "/welcome";
}
