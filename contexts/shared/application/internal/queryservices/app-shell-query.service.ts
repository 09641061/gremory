import type {
  AppShellHomeHref,
  AppShellViewModel,
  SidebarRouteId,
} from "@/contexts/shared/application/model/app-shell.view-models";
import type { EntryRouteSubscriptionState } from "@/contexts/shared/application/model/entry-route.view-models";
import { resolveEntryRoutePolicy } from "@/contexts/shared/application/services/entry-route.policy";
import { readErrorStatus } from "@/contexts/shared/application/errors/transport-error";
import type { BusinessWorkspaceQueryService } from "@/contexts/business/application/internal/queryservices/business-workspace-query.service";
import type { CurrentSubscriptionQueryService } from "@/contexts/billing/application/internal/queryservices/current-subscription-query.service";

type SubscriptionReader = Readonly<{
  getCurrentSubscription: (accessToken: string) => Promise<import("@/contexts/billing/domain/services/subscription-access.policy").SubscriptionAccessSnapshot>;
}>;

export interface AppShellQueryInput {
  accessToken?: string;
  workspace?: Readonly<{
    organizationId?: string;
    establishmentId?: string;
  }>;
}

export class AppShellQueryService {
  constructor(
    private readonly workspaceQuery: BusinessWorkspaceQueryService,
    private readonly billing: SubscriptionReader,
  ) {}

  async resolve({ workspace: workspaceSelection, accessToken }: AppShellQueryInput = {}): Promise<AppShellViewModel> {
    const workspace = await this.workspaceQuery.getHeaderViewModel(workspaceSelection ?? {});
    const accessPolicy = workspace.accessPolicy;
    const hasAssistantPolicy = accessPolicy?.canUseAssistant ?? false;
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
      hasAssistantPolicy,
    );

    const entry = resolveEntryRoutePolicy(
      workspace,
      await resolveWorkspaceSubscriptionState(workspace, this.billing, accessToken),
    );
    const isApplicationReady = entry.status === "ready";
    const hasAssistantAccess = isApplicationReady && (accessPolicy?.canUseAssistant ?? false);

    return {
      workspace,
      hasAssistantAccess,
      homeHref: resolveShellHomeHref(entry),
      visibleSidebarRoutes: isApplicationReady ? visibleSidebarRoutes : [],
    };
  }
}

export function createAppShellQueryService(
  workspaceQuery: BusinessWorkspaceQueryService,
  billing: CurrentSubscriptionQueryService,
): AppShellQueryService {
  return new AppShellQueryService(workspaceQuery, billing);
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

async function resolveWorkspaceSubscriptionState(
  workspace: AppShellViewModel["workspace"],
  billing: SubscriptionReader,
  accessToken: string | undefined,
): Promise<EntryRouteSubscriptionState> {
  if (workspace.accountType !== "OWNER") return "not-required";
  if (!accessToken) return "unavailable";

  try {
    const { hasActiveSubscription } = await import("@/contexts/billing/domain/services/subscription-access.policy");
    return hasActiveSubscription(await billing.getCurrentSubscription(accessToken))
      ? "active"
      : "inactive";
  } catch (error) {
    // Keep the shell conservative when Billing is unavailable. This is distinct
    // from a 404, which is the normal "no plan selected" state.
    return getErrorStatus(error) === 404 ? "inactive" : "unavailable";
  }
}

function getErrorStatus(error: unknown): number | undefined {
  return readErrorStatus(error);
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
