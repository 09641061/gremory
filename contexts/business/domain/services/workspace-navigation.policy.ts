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
  _accountType: WorkspaceNavigationAccountType,
  _establishment: WorkspaceNavigationEstablishment | undefined,
  fallbackPath: string,
): string {
  // The next request is resolved by the workspace access policy. Do not infer
  // a module route from establishment effective permissions in the browser.
  return fallbackPath;
}

export type WorkspaceNavigationGroupedEstablishment = WorkspaceNavigationEstablishment &
  Readonly<{
    photoUrl?: string | null;
    organizationId?: string;
    organizationName?: string;
    organizationImageUrl?: string | null;
  }>;

export type WorkspaceNavigationOrganizationGroup = Readonly<{
  organizationId: string;
  organizationName: string;
  organizationImageUrl: string | null;
  establishments: ReadonlyArray<WorkspaceNavigationGroupedEstablishment>;
  canUpdate?: boolean;
}>;

/**
 * The workspace exposes `establishments` as one combined list across every
 * organization the account touches - its own plus any it is a member of, and
 * each entry already only exists there because the workforce ACL granted
 * access to it. Grouping by organization is how "all organizations" reads
 * from that same, already-permission-scoped list: no separate authorization
 * check is needed here, only presentation.
 */
export function groupEstablishmentsByOrganization(
  establishments: ReadonlyArray<WorkspaceNavigationGroupedEstablishment>,
  currentOrganizationId?: string,
  currentOrganizationName?: string,
  currentOrganizationImageUrl?: string | null,
): ReadonlyArray<WorkspaceNavigationOrganizationGroup> {
  const order: string[] = [];
  const groups = new Map<
    string,
    { organizationName: string; organizationImageUrl: string | null; establishments: WorkspaceNavigationGroupedEstablishment[] }
  >();

  for (const establishment of establishments) {
    const organizationId = establishment.organizationId ?? currentOrganizationId;
    const organizationName =
      establishment.organizationName ??
      (organizationId === currentOrganizationId ? currentOrganizationName : undefined);
    if (!organizationId || !organizationName) continue;

    // Each establishment already carries its own organization's logo (the
    // backend batches it in), so it is preferred over the "active org only"
    // fallback - which otherwise leaves every foreign organization without one.
    const organizationImageUrl =
      establishment.organizationImageUrl ??
      (organizationId === currentOrganizationId ? currentOrganizationImageUrl ?? null : null);

    const existing = groups.get(organizationId);
    if (existing) {
      existing.establishments.push(establishment);
      if (!existing.organizationImageUrl && organizationImageUrl) {
        existing.organizationImageUrl = organizationImageUrl;
      }
      continue;
    }
    order.push(organizationId);
    groups.set(organizationId, { organizationName, organizationImageUrl, establishments: [establishment] });
  }

  return order.map((organizationId) => {
    const group = groups.get(organizationId)!;
    return {
      organizationId,
      organizationName: group.organizationName,
      organizationImageUrl: group.organizationImageUrl,
      establishments: group.establishments,
    };
  });
}

/**
 * Whether the account can edit this organization's name and logo: always
 * true for the one it owns, and for a foreign one only when some membership
 * inside it was granted `business:manage` - the same permission the backend
 * itself checks (`BusinessAccessPolicy.requireOrganizationPermission`), read
 * here from the same `effectivePermissions` set the workspace already scoped.
 */
export function canManageOrganization(
  organization: Pick<WorkspaceNavigationOrganizationGroup, "organizationId" | "establishments" | "canUpdate">,
  ownedOrganizationId: string | null,
): boolean {
  if (organization.canUpdate !== undefined) return organization.canUpdate;
  if (organization.organizationId === ownedOrganizationId) {
    return organization.establishments.some((establishment) =>
      establishment.effectivePermissions?.includes("business:manage"),
    );
  }
  return organization.establishments.some((establishment) =>
    establishment.effectivePermissions?.includes("business:manage"),
  );
}

/**
 * Whether the account has anywhere valid to cancel back to during a create
 * flow. Mandatory onboarding (fresh owner, no organization completed yet, no
 * membership anywhere else) has no such place - `onboardingCompleted` is
 * false and there is no foreign establishment in the combined list either.
 * A member starting a second business has one (its host organization) even
 * before its own new organization is complete; an owner adding another
 * establishment to an already-finished organization has one too.
 */
export function hasSomewhereToCancelTo(
  establishments: ReadonlyArray<Pick<WorkspaceNavigationGroupedEstablishment, "organizationId">>,
  currentOrganizationId: string | undefined,
  onboardingCompleted: boolean,
): boolean {
  if (onboardingCompleted) return true;
  return establishments.some(
    (establishment) => establishment.organizationId && establishment.organizationId !== currentOrganizationId,
  );
}
