import type { WorkspaceHeaderEstablishment, WorkspaceHeaderViewModel } from "@/contexts/business/application/model/business-workspace.view-models";

export function getWorkspaceEstablishment(
  workspace: WorkspaceHeaderViewModel,
  establishmentId?: string,
): WorkspaceHeaderEstablishment | undefined {
  if (!establishmentId) return undefined;
  return workspace.establishments.find((establishment) => establishment.id === establishmentId);
}

export function hasEstablishmentPermission(
  establishment: WorkspaceHeaderEstablishment | undefined,
  permission: string,
): boolean {
  return establishment?.effectivePermissions?.includes(permission) ?? false;
}
