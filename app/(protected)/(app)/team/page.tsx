import { createBusinessEstablishmentAclService } from "@/contexts/business/application/internal/outboundservices/business-establishment-acl.service";
import { createTeamQueryService } from "@/contexts/workforce/application/internal/queryservices/team-query.service";
import { TeamPageView } from "@/contexts/workforce/interfaces/components/team/team-page-view";
import { createWorkforceRoleQueryService } from "@/contexts/workforce/application/internal/queryservices/workforce-role-query.service";

export default async function TeamPage() {
  const establishmentId = await createBusinessEstablishmentAclService().getActiveEstablishmentIdForUser();
  let members: Awaited<ReturnType<ReturnType<typeof createTeamQueryService>["list"]>>["content"] = [];
  let roles: Awaited<ReturnType<ReturnType<typeof createWorkforceRoleQueryService>["list"]>> = [];
  if (establishmentId) {
    try {
      members = (await createTeamQueryService().list({ establishmentId, size: 100 })).content;
    } catch {
      // Keep the team shell available while workforce is unavailable.
    }
  }
  try { roles = await createWorkforceRoleQueryService().list(); } catch { /* Keep team available if roles are unavailable. */ }
  const roleOptions = roles.map((role) => ({
    id: role.id ?? "",
    name: role.getName(),
    position: role.position,
    systemRole: role.isSystemRole(),
  }));
  return <TeamPageView establishmentId={establishmentId} members={members} roles={roleOptions} canManageRoles={roleOptions.length > 0} />;
}
