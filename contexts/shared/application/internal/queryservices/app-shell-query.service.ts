import "server-only";

import { cookies } from "next/headers";
import { createCurrentSubscriptionQueryService } from "@/contexts/billing/application/internal/queryservices/current-subscription-query.service";
import {
  hasActiveSubscription,
  type SubscriptionAccessSnapshot,
} from "@/contexts/billing/domain/services/subscription-access.policy";
import { createBusinessWorkspaceQueryService } from "@/contexts/business/application/internal/queryservices/business-workspace-query.service";
import { iamSessionCookies } from "@/contexts/iam/infrastructure/session/iam-session-cookie";
import type {
  AppShellHomeHref,
  AppShellViewModel,
  SidebarRouteId,
} from "@/contexts/shared/application/model/app-shell.view-models";
import type { EntryRouteSubscriptionState } from "@/contexts/shared/application/model/entry-route.view-models";
import { resolveEntryRoutePolicy } from "@/contexts/shared/application/services/entry-route.policy";
import { ApiError } from "@/contexts/shared/infrastructure/http/api-client";

type SubscriptionReader = Readonly<{
  getCurrentSubscription: (accessToken: string) => Promise<SubscriptionAccessSnapshot>;
}>;

export interface AppShellQueryInput {
  workspace?: Readonly<{
    organizationId?: string;
    establishmentId?: string;
  }>;
}

export class AppShellQueryService {
  constructor(
    private readonly workspaceQuery = createBusinessWorkspaceQueryService(),
    private readonly billing: SubscriptionReader = createCurrentSubscriptionQueryService(),
  ) {}

  async resolve({ workspace: workspaceSelection }: AppShellQueryInput = {}): Promise<AppShellViewModel> {
    const workspace = await this.workspaceQuery.getHeaderViewModel(workspaceSelection);
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
      await resolveWorkspaceSubscriptionState(workspace, this.billing),
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
    routes.push("/branches");
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
): Promise<EntryRouteSubscriptionState> {
  if (workspace.accountType !== "OWNER") return "not-required";

  try {
    return hasActiveSubscription(await billing.getCurrentSubscription(await getAccessToken()))
      ? "active"
      : "inactive";
  } catch (error) {
    // Keep the shell conservative when Billing is unavailable. This is distinct
    // from a 404, which is the normal "no plan selected" state.
    return getErrorStatus(error) === 404 ? "inactive" : "unavailable";
  }
}

async function getAccessToken(): Promise<string> {
  const token = (await cookies()).get(iamSessionCookies.accessToken)?.value;
  if (!token) throw new ApiError("Authentication is required", 401);
  return token;
}

function getErrorStatus(error: unknown): number | undefined {
  if (error instanceof ApiError) return error.status;
  if (!error || typeof error !== "object") return undefined;
  const status = (error as { status?: unknown }).status;
  return typeof status === "number" ? status : undefined;
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
