import { createBusinessEstablishmentAclService } from "@/contexts/business/application/internal/outboundservices/business-establishment-acl.service";
import { createTeamQueryService } from "@/contexts/workforce/application/internal/queryservices/team-query.service";
import { createWorkforceRoleQueryService } from "@/contexts/workforce/application/internal/queryservices/workforce-role-query.service";
import type { WorkforceRoleSummary } from "@/contexts/workforce/application/model/workforce-role.read-models";
import { PermissionsPageView } from "@/contexts/workforce/interfaces/components/permissions/permissions-page-view";

interface PermissionsPageProps {
  searchParams: Promise<{ establishmentId?: string }>;
}

export default async function PermissionsPage({ searchParams }: PermissionsPageProps) {
  const { establishmentId: paramEstId } = await searchParams;
  const queryService = createWorkforceRoleQueryService();
  const aclService = createBusinessEstablishmentAclService();
  let defaultEstId = await aclService.getActiveEstablishmentIdForUser();
  if (!defaultEstId) {
    try {
      const access = await createTeamQueryService().getAccessContext();
      defaultEstId = access.establishments[0]?.establishmentId ?? undefined;
    } catch {}
  }
  const establishmentId = paramEstId ?? defaultEstId ?? undefined;
  
  let members: Awaited<ReturnType<ReturnType<typeof createTeamQueryService>["list"]>>["content"] = [];

  if (establishmentId) {
    try {
      members = (await createTeamQueryService().list({ establishmentId, size: 100 })).content;
    } catch {
      // Keep permissions page available if workforce members listing fails.
    }
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

  return <PermissionsPageView roles={roles} permissions={permissions} members={members} />;
}

