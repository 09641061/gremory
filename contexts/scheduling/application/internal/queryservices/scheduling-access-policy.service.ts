import { createTeamQueryService } from "@/contexts/workforce/application/internal/queryservices/team-query.service";
import { createOrganizationQueryService } from "@/contexts/business/application/internal/queryservices/organization-query.service";
import { createEstablishmentQueryService } from "@/contexts/business/application/internal/queryservices/establishment-query.service";

export interface SchedulingPermissions {
  canReadAppointments: boolean;
  canCreateAppointment: boolean;
  canUpdateAppointment: boolean;
  canDeleteAppointment: boolean;
}

export class SchedulingAccessPolicyService {
  async getPermissions(establishmentId?: string): Promise<SchedulingPermissions> {
    if (!establishmentId) {
      return {
        canReadAppointments: false,
        canCreateAppointment: false,
        canUpdateAppointment: false,
        canDeleteAppointment: false,
      };
    }

    try {
      // If user is owner, they have full permissions
      await createOrganizationQueryService().getMyOrganization();
      return {
        canReadAppointments: true,
        canCreateAppointment: true,
        canUpdateAppointment: true,
        canDeleteAppointment: true,
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
            canReadAppointments: false,
            canCreateAppointment: false,
            canUpdateAppointment: false,
            canDeleteAppointment: false,
          };
        }

        const perms = estAccess.effectivePermissions;
        const hasManage = perms.includes("scheduling:appointments:manage");
        const roles = estAccess.roles || [];
        const hasReadRole = roles.some((role) => role.name.toLowerCase() === "read");

        return {
          canReadAppointments:
            hasManage ||
            hasReadRole ||
            perms.includes("scheduling:appointments:read"),
          canCreateAppointment:
            hasManage ||
            perms.includes("scheduling:appointments:create"),
          canUpdateAppointment:
            hasManage ||
            perms.includes("scheduling:appointments:update"),
          canDeleteAppointment:
            hasManage ||
            perms.includes("scheduling:appointments:delete"),
        };
      } catch {
        return {
          canReadAppointments: false,
          canCreateAppointment: false,
          canUpdateAppointment: false,
          canDeleteAppointment: false,
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
                perm === "scheduling:appointments:read" ||
                perm === "scheduling:appointments:manage",
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

export function createSchedulingAccessPolicyService() {
  return new SchedulingAccessPolicyService();
}
