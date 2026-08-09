import { hasAnyPermission, hasReadRole } from "@/contexts/shared/application/internal/queryservices/access-context.helpers";
import type {
  EntryRouteEstablishment,
  EntryRoutePath,
} from "@/contexts/shared/application/model/entry-route.view-models";

export function resolveEmployeeEntryPath(
  establishments: ReadonlyArray<EntryRouteEstablishment>,
  hasAssistantAccess: boolean,
): EntryRoutePath {
  if (hasAssistantAccess) return "/chat";

  const routeChecks: ReadonlyArray<{
    path: Exclude<EntryRoutePath, "/chat">;
    matches: (establishment: EntryRouteEstablishment) => boolean;
  }> = [
    { path: "/schedule", matches: hasSchedulingAccess },
    { path: "/catalog", matches: hasCatalogAccess },
    { path: "/crm", matches: hasCrmAccess },
    { path: "/team", matches: hasTeamAccess },
    { path: "/organizations", matches: hasOrganizationAccess },
  ];

  return routeChecks.find((route) => establishments.some(route.matches))?.path ?? "/access-denied";
}

function hasSchedulingAccess(establishment: EntryRouteEstablishment) {
  return hasAnyPermission(establishment.effectivePermissions, [
    "scheduling:appointments:manage",
    "scheduling:appointments:read",
  ]) || hasReadRole(establishment.roles);
}

function hasCatalogAccess(establishment: EntryRouteEstablishment) {
  return hasAnyPermission(establishment.effectivePermissions, [
    "catalog:manage",
    "catalog:categories:read",
    "catalog:services:read",
  ]);
}

function hasCrmAccess(establishment: EntryRouteEstablishment) {
  return hasAnyPermission(establishment.effectivePermissions, [
    "crm:customers:manage",
    "crm:customers:read",
  ]) || hasReadRole(establishment.roles);
}

function hasTeamAccess(establishment: EntryRouteEstablishment) {
  return hasAnyPermission(establishment.effectivePermissions, [
    "workforce:members:manage",
    "workforce:members:read",
    "workforce:invitations:manage",
    "workforce:invitations:read",
  ]) || hasReadRole(establishment.roles);
}

function hasOrganizationAccess(establishment: EntryRouteEstablishment) {
  return hasAnyPermission(establishment.effectivePermissions, [
    "business:organizations:manage",
    "business:organizations:read",
    "business:manage",
  ]) || hasReadRole(establishment.roles);
}
