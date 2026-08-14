import { resolveEmployeeEntryPath } from "@/contexts/shared/application/services/entry-route-access.policy";

export type WorkspaceNavigationAccountType = "OWNER" | "MEMBER" | "PENDING_INVITATION";

export type WorkspaceNavigationEstablishment = Readonly<{
  id: string;
  name: string;
  effectivePermissions?: ReadonlyArray<string>;
}>;

/**
 * The selected establishment travels in the query string, so every workspace
 * link has to carry it. The organization never does: it is fixed for the
 * account, so a stale `organizationId` can only contradict the session.
 */
export function buildWorkspacePath(
  pathname: string,
  currentQuery: string,
  establishmentId?: string,
): string {
  const params = new URLSearchParams(currentQuery);
  params.delete("organizationId");
  if (establishmentId) params.set("establishmentId", establishmentId);
  else params.delete("establishmentId");

  return params.toString() ? `${pathname}?${params.toString()}` : pathname;
}

/**
 * Where switching to an establishment lands.
 *
 * An owner reads everything, so it stays on the current screen. A member may
 * have no permission for that screen in the establishment it just picked, so it
 * is sent to the first module its role can actually open.
 */
export function resolveEstablishmentEntryPath(
  accountType: WorkspaceNavigationAccountType,
  establishment: WorkspaceNavigationEstablishment | undefined,
  fallbackPath: string,
): string {
  if (accountType === "OWNER" || !establishment) return fallbackPath;

  return resolveEmployeeEntryPath(
    [
      {
        establishmentId: establishment.id,
        establishmentName: establishment.name,
        effectivePermissions: establishment.effectivePermissions ?? [],
      },
    ],
    false,
  );
}
