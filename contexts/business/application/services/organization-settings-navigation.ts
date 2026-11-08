import type { WorkspaceHeaderViewModel } from "../model/business-workspace.view-models";

export type OrganizationSettingsAccess = Readonly<{
  organization: boolean;
  members: boolean;
  roles: boolean;
  invites: boolean;
  establishments: boolean;
}>;

export type OrganizationSettingsHref =
  | "/organization"
  | "/organization/members"
  | "/organization/roles"
  | "/organization/invites"
  | "/establishments";

export function resolveOrganizationSettingsAccess(
  workspace: WorkspaceHeaderViewModel,
): OrganizationSettingsAccess {
  const owner = workspace.accountType === "OWNER";
  const canReadTeam = workspace.establishments.some((establishment) =>
    establishment.effectivePermissions?.includes("workforce:members:read"),
  );

  return {
    organization: owner || workspace.organization?.canUpdate === true,
    members: owner || canReadTeam,
    roles: owner,
    invites: owner,
    establishments: owner || workspace.canReadEstablishments,
  };
}

export function resolveOrganizationSettingsHome(
  workspace: WorkspaceHeaderViewModel,
): OrganizationSettingsHref | undefined {
  const access = resolveOrganizationSettingsAccess(workspace);
  if (access.organization) return "/organization";
  if (access.members) return "/organization/members";
  if (access.establishments) return "/establishments";
  return undefined;
}
