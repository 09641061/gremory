import "server-only";

import { hasActiveSubscription } from "@/contexts/billing/domain/services/subscription-access.policy";
import type { SubscriptionAccessSnapshot } from "@/contexts/billing/domain/services/subscription-access.policy";
import { createCurrentSubscriptionQueryService } from "@/contexts/billing/application/internal/queryservices/current-subscription-query.service";
import { ApiError } from "@/contexts/shared/infrastructure/http/api-client";
import { createBusinessWorkspaceOutboundService } from "../outboundservices/business-workspace.outbound.service";
import type { WorkspaceAccountType } from "@/contexts/business/application/model/business-workspace.view-models";
import {
  type EntryRouteInput,
  type EntryRouteResolution,
  type EntryRouteSubscriptionState,
} from "../../model/entry-route.view-models";
import { resolveEntryRoutePolicy } from "../../services/entry-route.policy";

type SubscriptionReader = Readonly<{
  getCurrentSubscription: (accessToken: string) => Promise<SubscriptionAccessSnapshot>;
}>;

/**
 * Resolves the authenticated entry route from the workspace and Billing. The
 * policy itself is pure; this service only coordinates the two bounded
 * contexts and translates transport failures into a safe route result.
 */
export class EntryRouteQueryService {
  constructor(
    private readonly workspace = createBusinessWorkspaceOutboundService(),
    private readonly billing: SubscriptionReader = createCurrentSubscriptionQueryService(),
  ) {}

  async resolveRoute({ accessToken, organizationId, establishmentId }: EntryRouteInput): Promise<EntryRouteResolution> {
    const resolved = await this.tryGet(() =>
      this.workspace.getWorkspace(accessToken, { organizationId, establishmentId }),
    );

    if (resolved.status !== "ready") {
      return resolved.status === "not-found" ? { status: "unavailable" } : resolved;
    }

    const workspace = resolved.data;
    const subscription = await this.resolveSubscriptionState(workspace.accountType, accessToken);

    return resolveEntryRoutePolicy(workspace, subscription);
  }

  private async resolveSubscriptionState(
    accountType: WorkspaceAccountType,
    accessToken: string,
  ): Promise<EntryRouteSubscriptionState> {
    if (accountType !== "OWNER") return "not-required";

    try {
      const subscription = await this.billing.getCurrentSubscription(accessToken);
      return hasActiveSubscription(subscription) ? "active" : "inactive";
    } catch (error) {
      // Billing uses 404 for an owner that has not selected a plan yet. Any
      // other failure is infrastructure/auth failure and must not masquerade
      // as a missing subscription.
      if (getErrorStatus(error) === 404) return "inactive";
      return "unavailable";
    }
  }

  private async tryGet<T>(load: () => Promise<T>): Promise<
    | { status: "ready"; data: T }
    | { status: "not-found" }
    | { status: "unauthenticated" }
    | { status: "unavailable" }
  > {
    try {
      return { status: "ready", data: await load() };
    } catch (error) {
      return classifyApiError(error);
    }
  }
}

function classifyApiError(error: unknown):
  | { status: "not-found" }
  | { status: "unauthenticated" }
  | { status: "unavailable" } {
  const status = getErrorStatus(error);
  if (status === 401) return { status: "unauthenticated" };
  if (status === 404) return { status: "not-found" };
  return { status: "unavailable" };
}

function getErrorStatus(error: unknown): number | undefined {
  if (error instanceof ApiError) return error.status;
  if (!error || typeof error !== "object") return undefined;
  const status = (error as { status?: unknown }).status;
  return typeof status === "number" ? status : undefined;
}

export function createEntryRouteQueryService() {
  return new EntryRouteQueryService();
}
