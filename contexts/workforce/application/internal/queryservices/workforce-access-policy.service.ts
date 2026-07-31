import { createTeamQueryService } from "@/contexts/workforce/application/internal/queryservices/team-query.service";
import { createOrganizationQueryService } from "@/contexts/business/application/internal/queryservices/organization-query.service";
import { createEstablishmentQueryService } from "@/contexts/business/application/internal/queryservices/establishment-query.service";

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
        const hasManageRoles = perms.includes("workforce:roles:manage");
        const hasManageInvitations = perms.includes("workforce:invitations:manage");
        const hasManageMembers = perms.includes("workforce:members:manage");
        const roles = estAccess.roles || [];
        const hasReadRole = roles.some((role) => role.name.toLowerCase() === "read");

        return {
          canReadTeam:
            hasManageMembers ||
            hasManageInvitations ||
            hasReadRole ||
            perms.includes("workforce:members:read") ||
            perms.includes("workforce:invitations:read"),
          canDeleteMember:
            hasManageMembers ||
            perms.includes("workforce:members:delete"),
          canCreateInvitation:
            hasManageInvitations ||
            perms.includes("workforce:invitations:create"),
          canDeleteInvitation:
            hasManageInvitations ||
            perms.includes("workforce:invitations:delete"),
          canReadRoles:
            hasManageRoles ||
            hasReadRole ||
            perms.includes("workforce:roles:read"),
          canCreateRole:
            hasManageRoles ||
            perms.includes("workforce:roles:create"),
          canUpdateRole:
            hasManageRoles ||
            perms.includes("workforce:roles:update"),
          canDeleteRole:
            hasManageRoles ||
            perms.includes("workforce:roles:delete"),
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
        const allowedEst = access.establishments.find((item) => {
          const roles = item.roles || [];
          const hasReadRole = roles.some((role) => role.name.toLowerCase() === "read");
          return (
            item.effectivePermissions.some(
              (perm) =>
                perm === "workforce:members:read" ||
                perm === "workforce:members:manage" ||
                perm === "workforce:invitations:read" ||
                perm === "workforce:invitations:manage",
            ) || hasReadRole
          );
        });
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
