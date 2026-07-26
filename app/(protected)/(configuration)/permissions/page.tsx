import { createWorkforceRoleQueryService } from "@/contexts/workforce/application/internal/queryservices/workforce-role-query.service";
import type { WorkforceRoleSummary } from "@/contexts/workforce/application/model/workforce-role.read-models";
import { PermissionsPageView } from "@/contexts/workforce/interfaces/components/permissions/permissions-page-view";

export default async function PermissionsPage() {
  const roles = (await createWorkforceRoleQueryService().list()).map((role): WorkforceRoleSummary => ({
    id: role.id,
    name: role.getName(),
    permissions: role.getPermissions(),
  }));

  return <PermissionsPageView roles={roles} />;
}
