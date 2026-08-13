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
    "scheduling:manage",
    "scheduling:read",
  ]) || hasReadRole(establishment.roles);
}

function hasCatalogAccess(establishment: EntryRouteEstablishment) {
  return hasAnyPermission(establishment.effectivePermissions, [
    "catalog:manage",
    "catalog:read",
  ]);
}

function hasCrmAccess(establishment: EntryRouteEstablishment) {
  return hasAnyPermission(establishment.effectivePermissions, [
    "crm:manage",
    "crm:read",
  ]) || hasReadRole(establishment.roles);
}

function hasTeamAccess(establishment: EntryRouteEstablishment) {
  return hasAnyPermission(establishment.effectivePermissions, [
    "workforce:manage",
    "workforce:read",
  ]) || hasReadRole(establishment.roles);
}

function hasOrganizationAccess(establishment: EntryRouteEstablishment) {
  return hasAnyPermission(establishment.effectivePermissions, [
    "business:manage",
    "business:read",
  ]) || hasReadRole(establishment.roles);
}
