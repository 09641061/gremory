import "server-only";

import { getApplicationHomePath, hasAssistantSubscriptionAccess, type SubscriptionAccessSnapshot } from "@/contexts/billing/domain/services/subscription-access.policy";
import { apiConfig } from "@/api.config";
import { createOrganizationQueryService } from "@/contexts/business/application/internal/queryservices/organization-query.service";
import { createEstablishmentQueryService } from "@/contexts/business/application/internal/queryservices/establishment-query.service";
import { createTeamQueryService } from "@/contexts/workforce/application/internal/queryservices/team-query.service";
import { ApiError, apiClient } from "@/contexts/shared/infrastructure/http/api-client";
import { hasAnyPermission, hasReadRole } from "@/contexts/shared/application/internal/queryservices/access-context.helpers";

export type LandingPathEstablishment = Readonly<{
  organizationId: string;
  organizationName: string;
  establishmentId: string;
  establishmentName: string;
  roles?: ReadonlyArray<{ name: string }>;
  effectivePermissions: ReadonlyArray<string>;
}>;

export type LandingPathOwnerData = Readonly<{
  organization: {
    id: string;
    name: string;
    imageUrl?: string | null;
  };
  establishments: ReadonlyArray<{
    id: string;
    name: string;
    photoUrl?: string | null;
  }>;
}>;

export type LandingPathEmployeeData = Readonly<{
  establishments: ReadonlyArray<LandingPathEstablishment>;
}>;

export type LandingPathResolution =
  | {
      status: "ready";
      homeHref: "/chat" | "/schedule" | "/catalog" | "/crm" | "/team" | "/organizations";
      hasWorkforceAccess: boolean;
      ownerData?: LandingPathOwnerData;
      employeeData?: LandingPathEmployeeData;
    }
  | {
      status: "unavailable";
    };

export type LandingRouteResolution =
  | {
      status: "ready";
      homeHref: "/chat" | "/schedule" | "/catalog" | "/crm" | "/team" | "/organizations";
      hasWorkforceAccess: boolean;
    }
  | {
      status: "unauthenticated";
    }
  | {
      status: "unavailable";
    };

export interface LandingPathInput {
  accessToken: string;
  subscription: SubscriptionAccessSnapshot | null | undefined;
}

export class LandingPathQueryService {
  async resolveRoute({ accessToken, subscription }: LandingPathInput): Promise<LandingRouteResolution> {
    try {
      await apiClient.get(apiConfig.routes.organizations, { token: accessToken });
      return {
        status: "ready",
        homeHref: getApplicationHomePath(subscription),
        hasWorkforceAccess: false,
      };
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        return { status: "unauthenticated" };
      }
      // Fall through to employee access if the user does not own an organization.
    }

    try {
      const access = await apiClient.get<{
        active?: boolean;
        establishments?: Array<{
          organizationId: string;
          organizationName: string;
          establishmentId: string;
          establishmentName: string;
          roles?: Array<{ name: string }>;
          effectivePermissions?: string[];
        }>;
      }>(apiConfig.routes.workforce.access, { token: accessToken });
      return {
        status: "ready",
        homeHref: resolveEmployeeHomePath(
          (access.establishments ?? []).map((establishment) => ({
            organizationId: establishment.organizationId,
            organizationName: establishment.organizationName,
            establishmentId: establishment.establishmentId,
            establishmentName: establishment.establishmentName,
            roles: establishment.roles,
            effectivePermissions: establishment.effectivePermissions ?? [],
          })),
          subscription,
        ),
        hasWorkforceAccess: access.active === true || (access.establishments?.length ?? 0) > 0,
      };
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        return { status: "unauthenticated" };
      }
      if (error instanceof ApiError && error.status === 404) {
        return {
          status: "ready",
          homeHref: "/organizations",
          hasWorkforceAccess: false,
        };
      }
      return {
        status: "unavailable",
      };
    }
  }

  async getHeaderData({ accessToken, subscription }: LandingPathInput): Promise<LandingPathResolution> {
    let ownerData: LandingPathOwnerData | undefined;

    try {
      const currentOrganization = await createOrganizationQueryService(accessToken).getMyOrganization();
      const page = await createEstablishmentQueryService(accessToken).getByOrganization({
        organizationId: currentOrganization.id,
        page: 0,
        size: 100,
      });

      ownerData = {
        organization: {
          id: currentOrganization.id,
          name: currentOrganization.name,
          imageUrl: currentOrganization.imageUrl,
        },
        establishments: page.content.map((establishment) => ({
          id: establishment.id,
          name: establishment.name,
          photoUrl: establishment.photoUrl,
        })),
      };

      return {
        status: "ready",
        homeHref: getApplicationHomePath(subscription),
        hasWorkforceAccess: false,
        ownerData,
      };
    } catch {
      // Fall through to employee access if the user does not own an organization.
    }

    try {
      const access = await createTeamQueryService(accessToken).getAccessContext();
      const employeeData: LandingPathEmployeeData = {
        establishments: access.establishments.map((est) => ({
          organizationId: est.organizationId,
          organizationName: est.organizationName,
          establishmentId: est.establishmentId,
          establishmentName: est.establishmentName,
          roles: est.roles,
          effectivePermissions: Array.from(est.effectivePermissions),
        })),
      };

      return {
        status: "ready",
        homeHref: resolveEmployeeHomePath(employeeData.establishments, subscription),
        hasWorkforceAccess: employeeData.establishments.length > 0,
        employeeData,
      };
    } catch {
      return {
        status: "unavailable",
      };
    }
  }
}

export function createLandingPathQueryService() {
  return new LandingPathQueryService();
}

function resolveEmployeeHomePath(
  establishments: ReadonlyArray<LandingPathEstablishment>,
  subscription: SubscriptionAccessSnapshot | null | undefined,
): "/chat" | "/schedule" | "/catalog" | "/crm" | "/team" | "/organizations" {
  if (hasAssistantSubscriptionAccess(subscription)) {
    return "/chat";
  }

  const routeChecks = [
    { path: "/schedule" as const, matches: hasSchedulingAccess },
    { path: "/catalog" as const, matches: hasCatalogAccess },
    { path: "/crm" as const, matches: hasCrmAccess },
    { path: "/team" as const, matches: hasTeamAccess },
    { path: "/organizations" as const, matches: hasOrganizationAccess },
  ];

  for (const route of routeChecks) {
    if (establishments.some((establishment) => route.matches(establishment))) {
      return route.path;
    }
  }

  return "/organizations";
}

function hasSchedulingAccess(establishment: LandingPathEstablishment): boolean {
  const perms = establishment.effectivePermissions;
  return hasAnyPermission(perms, [
    "scheduling:appointments:manage",
    "scheduling:appointments:read",
  ]) || hasReadRole(establishment.roles);
}

function hasCatalogAccess(establishment: LandingPathEstablishment): boolean {
  const perms = establishment.effectivePermissions;
  return hasAnyPermission(perms, [
    "catalog:manage",
    "catalog:categories:read",
    "catalog:services:read",
  ]);
}

function hasCrmAccess(establishment: LandingPathEstablishment): boolean {
  const perms = establishment.effectivePermissions;
  return hasAnyPermission(perms, ["crm:customers:manage", "crm:customers:read"]) ||
    hasReadRole(establishment.roles);
}

function hasTeamAccess(establishment: LandingPathEstablishment): boolean {
  const perms = establishment.effectivePermissions;
  return hasAnyPermission(perms, [
    "workforce:members:manage",
    "workforce:members:read",
    "workforce:invitations:manage",
    "workforce:invitations:read",
  ]) || hasReadRole(establishment.roles);
}

function hasOrganizationAccess(establishment: LandingPathEstablishment): boolean {
  const perms = establishment.effectivePermissions;
  return hasAnyPermission(perms, [
    "business:organizations:manage",
    "business:organizations:read",
    "business:manage",
  ]) || hasReadRole(establishment.roles);
}
