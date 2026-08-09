import "server-only";

import { createSubscriptionAccessQueryService } from "@/contexts/billing/application/internal/queryservices/subscription-access-query.service";
import { ApiError } from "@/contexts/shared/infrastructure/http/api-client";
import {
  createBusinessEntryAccessOutboundService,
} from "../outboundservices/business-entry-access.outbound.service";
import { createWorkforceEntryAccessOutboundService } from "../outboundservices/workforce-entry-access.outbound.service";
import { resolveEmployeeEntryPath } from "../../services/entry-route-access.policy";
import type {
  EntryRouteEstablishment,
  EntryRouteInput,
  EntryRouteResolution,
} from "../../model/entry-route.view-models";

export class EntryRouteQueryService {
  constructor(
    private readonly businessAccess = createBusinessEntryAccessOutboundService(),
    private readonly workforceAccess = createWorkforceEntryAccessOutboundService(),
  ) {}

  async resolveRoute({ accessToken, subscription }: EntryRouteInput): Promise<EntryRouteResolution> {
    const organization = await this.tryGet(() => this.businessAccess.getOwnedOrganization(accessToken));

    if (organization.status === "unauthenticated" || organization.status === "unavailable") {
      return organization;
    }

    if (organization.status === "ready") {
      const establishments = await this.tryGet(() =>
        this.businessAccess.getOrganizationEstablishments(accessToken, organization.data.id),
      );

      if (establishments.status === "unauthenticated" || establishments.status === "unavailable") {
        return establishments;
      }
      if (establishments.status === "not-found" || establishments.data.length === 0) {
        return { status: "establishment-required", setupHref: "/establishments/new" };
      }

      return {
        status: "ready",
        homeHref: createSubscriptionAccessQueryService().resolve(subscription).homeHref,
      };
    }

    const workforce = await this.tryGet(() => this.workforceAccess.getAccessContext(accessToken));
    if (workforce.status === "unauthenticated" || workforce.status === "unavailable") {
      return workforce;
    }

    if (workforce.status === "not-found") {
      return { status: "organization-required", setupHref: "/organizations" };
    }

    const establishments = toEntryEstablishments(workforce.data);
    if (establishments.length === 0) {
      return { status: "organization-required", setupHref: "/organizations" };
    }

    return {
      status: "ready",
      homeHref: resolveEmployeeEntryPath(
        establishments,
        createSubscriptionAccessQueryService().resolve(subscription).hasAssistantAccess,
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

function toEntryEstablishments(access: {
  active?: boolean;
  establishments: ReadonlyArray<Omit<EntryRouteEstablishment, "effectivePermissions"> & {
    effectivePermissions?: ReadonlyArray<string>;
  }>;
}): ReadonlyArray<EntryRouteEstablishment> {
  if (access.active === false) return [];
  return access.establishments.map((establishment) => ({
    ...establishment,
    effectivePermissions: establishment.effectivePermissions ?? [],
  }));
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

