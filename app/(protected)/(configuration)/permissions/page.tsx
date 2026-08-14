import { createTeamQueryService } from "@/contexts/workforce/application/internal/queryservices/team-query.service";
import { createWorkforceRoleQueryService } from "@/contexts/workforce/application/internal/queryservices/workforce-role-query.service";
import type { WorkforceRoleSummary } from "@/contexts/workforce/application/model/workforce-role.read-models";
import { PermissionsPageView } from "@/contexts/workforce/interfaces/components/permissions/permissions-page-view";

import { createWorkforceAccessPolicyService } from "@/contexts/workforce/application/internal/queryservices/workforce-access-policy.service";
import { redirect } from "next/navigation";
import { createBusinessWorkspaceQueryService } from "@/contexts/business/application/internal/queryservices/business-workspace-query.service";

interface PermissionsPageProps {
  searchParams: Promise<{ establishmentId?: string }>;
}

export default async function PermissionsPage({ searchParams }: PermissionsPageProps) {
  const query = await searchParams;
  const workspace = await createBusinessWorkspaceQueryService().getHeaderViewModel(query);
  const { establishmentId: paramEstId } = query;
  const queryService = createWorkforceRoleQueryService();

  const policyService = createWorkforceAccessPolicyService();
  const establishmentId = paramEstId ?? workspace.activeEstablishmentId;

  const { canReadRoles, canCreateRole, canUpdateRole, canDeleteRole } = await policyService.getPermissions(establishmentId);

  if (!canReadRoles) {
    redirect("/access-denied");
  }

  let members: Awaited<ReturnType<ReturnType<typeof createTeamQueryService>["list"]>>["content"] = [];

  if (establishmentId) {
    members = (await createTeamQueryService().list({ establishmentId, size: 100 })).content;
  }

  const [roleEntities, permissions] = await Promise.all([
    queryService.list(),
    queryService.permissions(),
  ]);

  const roles = roleEntities.map((role): WorkforceRoleSummary => ({
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
      canCreateRole={canCreateRole}
      canUpdateRole={canUpdateRole}
      canDeleteRole={canDeleteRole}
    />
  );
}
