import { createTeamQueryService } from "@/contexts/workforce/application/internal/queryservices/team-query.service";
import { createOrganizationQueryService } from "@/contexts/business/application/internal/queryservices/organization-query.service";
import { createEstablishmentQueryService } from "@/contexts/business/application/internal/queryservices/establishment-query.service";
import {
  findFirstMatchingEstablishment,
  hasAnyPermission,
  hasReadRole,
} from "@/contexts/shared/application/internal/queryservices/access-context.helpers";

export interface WorkforcePermissions {
  canReadTeam: boolean;
  canDeleteMember: boolean;
  canCreateInvitation: boolean;
  canDeleteInvitation: boolean;
  canReadRoles: boolean;
  canCreateRole: boolean;
  canUpdateRole: boolean;
  canDeleteRole: boolean;
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
      };
    }

    try {
      // If user is owner, they have full permissions
      await createOrganizationQueryService().getMyOrganization();
      return {
        canReadTeam: true,
        canDeleteMember: true,
        canCreateInvitation: true,
        canDeleteInvitation: true,
        canReadRoles: true,
        canCreateRole: true,
        canUpdateRole: true,
        canDeleteRole: true,
      };
    } catch {
      // Employee: load from workforce access context
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
          };
        }

        const perms = estAccess.effectivePermissions;
        const hasManageRoles = hasAnyPermission(perms, ["workforce:roles:manage"]);
        const hasManageInvitations = hasAnyPermission(perms, ["workforce:invitations:manage"]);
        const hasManageMembers = hasAnyPermission(perms, ["workforce:members:manage"]);

        return {
          canReadTeam:
            hasManageMembers ||
            hasManageInvitations ||
            hasReadRole(estAccess.roles) ||
            hasAnyPermission(perms, ["workforce:members:read", "workforce:invitations:read"]),
          canDeleteMember:
            hasManageMembers ||
            hasAnyPermission(perms, ["workforce:members:delete"]),
          canCreateInvitation:
            hasManageInvitations ||
            hasAnyPermission(perms, ["workforce:invitations:create"]),
          canDeleteInvitation:
            hasManageInvitations ||
            hasAnyPermission(perms, ["workforce:invitations:delete"]),
          canReadRoles:
            hasManageRoles ||
            hasReadRole(estAccess.roles) ||
            hasAnyPermission(perms, ["workforce:roles:read"]),
          canCreateRole:
            hasManageRoles ||
            hasAnyPermission(perms, ["workforce:roles:create"]),
          canUpdateRole:
            hasManageRoles ||
            hasAnyPermission(perms, ["workforce:roles:update"]),
          canDeleteRole:
            hasManageRoles ||
            hasAnyPermission(perms, ["workforce:roles:delete"]),
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
        };
      }
    }
  }

  async getDefaultEstablishmentId(): Promise<string | undefined> {
    try {
      const org = await createOrganizationQueryService().getMyOrganization();
      const page = await createEstablishmentQueryService().getByOrganization({
        organizationId: org.id,
        page: 0,
        size: 1,
      });
      if (page.content.length > 0) {
        return page.content[0].id;
      }
    } catch {
      try {
        const access = await createTeamQueryService().getAccessContext();
        const allowedEst = findFirstMatchingEstablishment(access.establishments, (item) =>
          hasAnyPermission(item.effectivePermissions, [
            "workforce:members:read",
            "workforce:members:manage",
            "workforce:invitations:read",
            "workforce:invitations:manage",
          ]) || hasReadRole(item.roles),
        );
        return allowedEst?.establishmentId;
      } catch {
        return undefined;
      }
    }
  }
}

export function createWorkforceAccessPolicyService() {
  return new WorkforceAccessPolicyService();
}
