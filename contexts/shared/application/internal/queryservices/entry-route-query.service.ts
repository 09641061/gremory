import "server-only";

import { createSubscriptionAccessQueryService } from "@/contexts/billing/application/internal/queryservices/subscription-access-query.service";
import { ApiError } from "@/contexts/shared/infrastructure/http/api-client";
import { createBusinessWorkspaceOutboundService } from "../outboundservices/business-workspace.outbound.service";
import { resolveEmployeeEntryPath } from "../../services/entry-route-access.policy";
import type {
  EntryRouteInput,
  EntryRouteResolution,
} from "../../model/entry-route.view-models";

/**
 * Resolves where an authenticated account lands, from the single workspace call.
 * The account type is read, never inferred: OWNER, MEMBER or an invitation that
 * was never accepted.
 */
export class EntryRouteQueryService {
  constructor(private readonly workspace = createBusinessWorkspaceOutboundService()) {}

  async resolveRoute({ accessToken, subscription }: EntryRouteInput): Promise<EntryRouteResolution> {
    const resolved = await this.tryGet(() => this.workspace.getWorkspace(accessToken));

    if (resolved.status !== "ready") {
      return resolved.status === "not-found" ? { status: "unavailable" } : resolved;
    }

    const workspace = resolved.data;

    if (workspace.accountType === "PENDING_INVITATION") {
      return {
        status: "invitation-pending",
        setupHref: "/invitations/pending",
        allowedPaths: ["/invitations/pending"],
      };
    }

    if (workspace.establishments.length === 0) {
      return workspace.canCreateEstablishment
        ? {
            status: "establishment-required",
            setupHref: "/establishments/new",
            allowedPaths: ["/establishments/new"],
          }
        : { status: "ready", homeHref: "/access-denied" };
    }

    const hasAssistantAccess = createSubscriptionAccessQueryService().resolve(subscription)
      .hasAssistantAccess;

    if (workspace.accountType === "OWNER") {
      return {
        status: "ready",
        homeHref: createSubscriptionAccessQueryService().resolve(subscription).homeHref,
      };
    }

    return {
      status: "ready",
      homeHref: resolveEmployeeEntryPath(
        workspace.establishments.map((establishment) => ({
          establishmentId: establishment.id,
          establishmentName: establishment.name,
          effectivePermissions: establishment.effectivePermissions ?? [],
        })),
        hasAssistantAccess,
      ),
    };
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
  if (error instanceof ApiError && error.status === 401) {
    return { status: "unauthenticated" };
  }
  if (error instanceof ApiError && error.status === 404) {
    return { status: "not-found" };
  }
  return { status: "unavailable" };
}

export function createEntryRouteQueryService() {
  return new EntryRouteQueryService();
}
