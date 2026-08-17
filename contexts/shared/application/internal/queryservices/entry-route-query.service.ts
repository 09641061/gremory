import "server-only";

import { ApiError } from "@/contexts/shared/infrastructure/http/api-client";
import { createBusinessWorkspaceOutboundService } from "../outboundservices/business-workspace.outbound.service";
import type { BusinessWorkspaceOutboundService } from "../outboundservices/business-workspace.outbound.service";
import type { EntryRouteInput, EntryRouteResolution } from "../../model/entry-route.view-models";

/**
 * Resolves where an authenticated account lands from the business workspace
 * alone. Billing is optional enrichment, never the bootstrap gate.
 */
export class EntryRouteQueryService {
  constructor(private readonly workspace = createBusinessWorkspaceOutboundService()) {}

  async resolveRoute({ accessToken, organizationId, establishmentId }: EntryRouteInput): Promise<EntryRouteResolution> {
    const resolved = await this.tryGet(() =>
      this.workspace.getWorkspace(accessToken, { organizationId, establishmentId }),
    );

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

    if (workspace.onboardingStatus === "ORGANIZATION_PENDING") {
      return {
        status: "organization-required",
        setupHref: "/organizations/new",
        allowedPaths: ["/organizations/new"],
      };
    }

    if (workspace.onboardingStatus === "ESTABLISHMENT_PENDING") {
      return {
        status: "establishment-required",
        setupHref: "/establishments/new",
        allowedPaths: ["/establishments/new"],
      };
    }

    const ownEstablishments = workspace.organization
      ? workspace.establishments.filter(
          (establishment) =>
            !establishment.organizationId || establishment.organizationId === workspace.organization!.id,
        )
      : workspace.establishments;

    if (ownEstablishments.length === 0) {
      return workspace.canCreateEstablishment
        ? {
            status: "establishment-required",
            setupHref: "/establishments/new",
            allowedPaths: ["/establishments/new"],
          }
        : { status: "ready", homeHref: "/access-denied" };
    }

    return {
      status: "ready",
      homeHref: resolveAccessPolicyEntryPath(workspace),
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

function resolveAccessPolicyEntryPath(
  workspace: Awaited<ReturnType<BusinessWorkspaceOutboundService["getWorkspace"]>>,
) {
  const accessPolicy = workspace.accessPolicy;
  if (!accessPolicy) return "/access-denied" as const;
  if (accessPolicy.canUseAssistant) return "/chat" as const;
  if (accessPolicy.canOpenScheduling) return "/schedule" as const;
  if (accessPolicy.canOpenCatalog) return "/catalog" as const;
  if (accessPolicy.canOpenCrm) return "/crm" as const;
  if (accessPolicy.canOpenTeam) return "/team" as const;
  if (workspace.organization?.canRead) return "/organization" as const;
  return "/access-denied" as const;
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
