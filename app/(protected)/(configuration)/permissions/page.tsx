import { createTeamQueryService } from "@/contexts/workforce/application/internal/queryservices/team-query.service";
import { createWorkforceRoleQueryService } from "@/contexts/workforce/application/internal/queryservices/workforce-role-query.service";
import type { WorkforceRoleSummary } from "@/contexts/workforce/application/model/workforce-role.read-models";
import { PermissionsPageView } from "@/contexts/workforce/interfaces/components/permissions/permissions-page-view";

import { redirect } from "next/navigation";
import { createBusinessWorkspaceQueryService } from "@/contexts/business/application/internal/queryservices/business-workspace-query.service";
import { getWorkspaceEstablishment, hasEstablishmentPermission } from "@/contexts/shared/application/services/workspace-establishment-permissions";

interface PermissionsPageProps {
  searchParams: Promise<{ establishmentId?: string }>;
}

export default async function PermissionsPage({ searchParams }: PermissionsPageProps) {
  const query = await searchParams;
  const workspace = await createBusinessWorkspaceQueryService().getHeaderViewModel(query);
  const { establishmentId: paramEstId } = query;
  const queryService = createWorkforceRoleQueryService();

  const establishmentId = paramEstId ?? workspace.activeEstablishmentId;
  const establishment = getWorkspaceEstablishment(workspace, establishmentId);
  const organizationId = establishment?.organizationId ?? workspace.organization?.id;
  const canManageRoles = hasEstablishmentPermission(establishment, "workforce:manage_roles") ||
    hasEstablishmentPermission(establishment, "workforce:manage");
  const canReadRoles = canManageRoles;
  const canCreateRole = canManageRoles;
  const canUpdateRole = canManageRoles;
  const canDeleteRole = canManageRoles;

  if (!canReadRoles) {
    redirect("/access-denied");
  }

  let members: Awaited<ReturnType<ReturnType<typeof createTeamQueryService>["list"]>>["content"] = [];

  if (establishmentId) {
    members = (await createTeamQueryService().list({ establishmentId, size: 100 })).content;
  }

  const [roleEntities, permissions] = await Promise.all([
    queryService.list(organizationId),
    queryService.permissions(),
  ]);

  const roles = roleEntities
    .filter((role) => role.getName().trim().toLowerCase() !== "everyone")
    .map((role): WorkforceRoleSummary => ({
      id: role.id,
      name: role.getName(),
      permissions: role.getPermissions(),
      systemRole: role.isSystemRole(),
      position: role.position,
    }));

  return (
    <PermissionsPageView
      roles={roles}
      permissions={permissions}
      members={members}
      authorization={workspace.authorization}
      canCreateRole={canCreateRole}
      canUpdateRole={canUpdateRole}
      canDeleteRole={canDeleteRole}
    />
  );
}
