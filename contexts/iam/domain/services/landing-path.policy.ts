import { getApplicationHomePath, hasAssistantSubscriptionAccess, type SubscriptionAccessSnapshot } from "@/contexts/billing/domain/services/subscription-access.policy";

export type LandingPathEstablishment = Readonly<{
  organizationId: string;
  organizationName: string;
  establishmentId: string;
  establishmentName: string;
  roles?: ReadonlyArray<{ name: string }>;
  effectivePermissions: ReadonlyArray<string>;
}>;

export interface LandingPathSnapshot {
  subscription: SubscriptionAccessSnapshot | null | undefined;
  hasOrganization: boolean;
  workforceEstablishments: ReadonlyArray<LandingPathEstablishment>;
}

export function resolveApplicationHomePath(snapshot: LandingPathSnapshot): "/chat" | "/schedule" | "/catalog" | "/crm" | "/team" | "/organizations" {
  if (hasAssistantSubscriptionAccess(snapshot.subscription)) {
    return "/chat";
  }

  if (snapshot.hasOrganization) {
    return getApplicationHomePath(snapshot.subscription);
  }

  const employeeHome = resolveEmployeeHomePath(snapshot.workforceEstablishments);
  return employeeHome ?? "/organizations";
}

function resolveEmployeeHomePath(
  establishments: ReadonlyArray<LandingPathEstablishment>,
): "/schedule" | "/catalog" | "/crm" | "/team" | "/organizations" | null {
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

  return null;
}

function hasSchedulingAccess(establishment: LandingPathEstablishment): boolean {
  const perms = establishment.effectivePermissions;
  return perms.includes("scheduling:appointments:manage") ||
    perms.includes("scheduling:appointments:read") ||
    hasReadRole(establishment);
}

function hasCatalogAccess(establishment: LandingPathEstablishment): boolean {
  const perms = establishment.effectivePermissions;
  return perms.includes("catalog:manage") ||
    perms.includes("catalog:categories:read") ||
    perms.includes("catalog:services:read");
}

function hasCrmAccess(establishment: LandingPathEstablishment): boolean {
  const perms = establishment.effectivePermissions;
  return perms.includes("crm:customers:manage") ||
    perms.includes("crm:customers:read") ||
    hasReadRole(establishment);
}

function hasTeamAccess(establishment: LandingPathEstablishment): boolean {
  const perms = establishment.effectivePermissions;
  return perms.includes("workforce:members:manage") ||
    perms.includes("workforce:members:read") ||
    perms.includes("workforce:invitations:manage") ||
    perms.includes("workforce:invitations:read") ||
    hasReadRole(establishment);
}

function hasOrganizationAccess(establishment: LandingPathEstablishment): boolean {
  const perms = establishment.effectivePermissions;
  return perms.includes("business:organizations:manage") ||
    perms.includes("business:organizations:read") ||
    perms.includes("business:manage") ||
    hasReadRole(establishment);
}

function hasReadRole(establishment: LandingPathEstablishment): boolean {
  return establishment.roles?.some((role) => role.name.toLowerCase() === "read") ?? false;
}
