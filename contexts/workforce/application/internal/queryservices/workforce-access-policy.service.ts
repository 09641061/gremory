import { createTeamQueryService } from "@/contexts/workforce/application/internal/queryservices/team-query.service";
import { hasAnyPermission } from "@/contexts/shared/application/internal/queryservices/access-context.helpers";

export interface WorkforcePermissions {
  canReadTeam: boolean;
  canDeleteMember: boolean;
  canCreateInvitation: boolean;
  canDeleteInvitation: boolean;
  canReadRoles: boolean;
  canCreateRole: boolean;
  canUpdateRole: boolean;
  canDeleteRole: boolean;
  canEditEstablishmentProfile: boolean;
  canOpenModules: boolean;
}

export class WorkforceAccessPolicyService {
  async getPermissions(establishmentId?: string): Promise<WorkforcePermissions> {
    if (!establishmentId) {
      return {
        canReadTeam: false,
        canDeleteMember: false,
        canCreateInvitation: false,
        canDeleteInvitation: false,
        canReadRoles: false,
        canCreateRole: false,
        canUpdateRole: false,
        canDeleteRole: false,
        canEditEstablishmentProfile: false,
        canOpenModules: false,
      };
    }

    try {
      const access = await createTeamQueryService().getAccessContext();
      const estAccess = access.establishments.find(
        (item) => item.establishmentId === establishmentId,
      );
      if (!estAccess) {
        return {
          canReadTeam: false,
          canDeleteMember: false,
          canCreateInvitation: false,
          canDeleteInvitation: false,
          canReadRoles: false,
          canCreateRole: false,
          canUpdateRole: false,
          canDeleteRole: false,
          canEditEstablishmentProfile: false,
          canOpenModules: false,
        };
      }

      const perms = estAccess.effectivePermissions;
      const capabilities = access.membershipCapabilities;
      const hasManage = hasAnyPermission(perms, ["workforce:manage"]);
      const canOpenModules = capabilities?.canOpenModules ?? (hasManage || hasAnyPermission(perms, ["workforce:read"]));
      const canReadTeam =
        canOpenModules &&
        (capabilities?.canReadTeam ?? (hasManage || hasAnyPermission(perms, ["workforce:read"])));
      const canCreateInvitation = canOpenModules && (capabilities?.canCreateInvitation ?? hasManage);
      const canDeleteInvitation = canOpenModules && (capabilities?.canDeleteInvitation ?? hasManage);
      const canUpdateRole = canOpenModules && (capabilities?.canUpdateRole ?? hasManage);
      const canDeleteRole = canOpenModules && (capabilities?.canDeleteRole ?? hasManage);
      const canCreateRole = canUpdateRole;
      const canEditEstablishmentProfile =
        canOpenModules &&
        (capabilities?.canEditEstablishmentProfile ??
          hasAnyPermission(perms, ["establishment:update"]));
       return {
         canReadTeam,
         canDeleteMember: canOpenModules && (capabilities?.canDeleteInvitation ?? hasManage),
        canCreateInvitation,
        canDeleteInvitation,
         canReadRoles: canCreateRole || canUpdateRole || canDeleteRole,
        canCreateRole,
        canUpdateRole,
        canDeleteRole,
        canEditEstablishmentProfile,
        canOpenModules,
      };
    } catch {
      return {
        canReadTeam: false,
        canDeleteMember: false,
        canCreateInvitation: false,
        canDeleteInvitation: false,
        canReadRoles: false,
        canCreateRole: false,
        canUpdateRole: false,
        canDeleteRole: false,
        canEditEstablishmentProfile: false,
        canOpenModules: false,
      };
    }
  }
}

export function createWorkforceAccessPolicyService() {
  return new WorkforceAccessPolicyService();
}
