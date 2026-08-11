import { hasAnyPermission } from "@/contexts/shared/application/internal/queryservices/access-context.helpers";
import type {
  EntryRouteEstablishment,
  EntryRoutePath,
} from "@/contexts/shared/application/model/entry-route.view-models";
import { workforcePermissions } from "@/contexts/workforce/domain/model/enums/workforce-permission";

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
    workforcePermissions.scheduling.manage,
    workforcePermissions.scheduling.read,
  ]);
}

function hasCatalogAccess(establishment: EntryRouteEstablishment) {
  return hasAnyPermission(establishment.effectivePermissions, [
    workforcePermissions.catalog.read,
    workforcePermissions.catalog.manage,
  ]);
}

function hasCrmAccess(establishment: EntryRouteEstablishment) {
  return hasAnyPermission(establishment.effectivePermissions, [
    workforcePermissions.crm.manage,
    workforcePermissions.crm.read,
  ]);
}

function hasTeamAccess(establishment: EntryRouteEstablishment) {
  return hasAnyPermission(establishment.effectivePermissions, [
    workforcePermissions.workforce.manage,
    workforcePermissions.workforce.read,
  ]);
}

function hasOrganizationAccess(establishment: EntryRouteEstablishment) {
  return hasAnyPermission(establishment.effectivePermissions, [
    workforcePermissions.business.manage,
    workforcePermissions.business.read,
  ]);
}
