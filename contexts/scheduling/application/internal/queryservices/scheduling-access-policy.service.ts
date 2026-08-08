import { createTeamQueryService } from "@/contexts/workforce/application/internal/queryservices/team-query.service";
import { createOrganizationQueryService } from "@/contexts/business/application/internal/queryservices/organization-query.service";
import { createEstablishmentQueryService } from "@/contexts/business/application/internal/queryservices/establishment-query.service";
import {
  findFirstMatchingEstablishment,
  hasAnyPermission,
  hasReadRole,
} from "@/contexts/shared/application/internal/queryservices/access-context.helpers";

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
        const hasManage = hasAnyPermission(perms, ["scheduling:appointments:manage"]);

        return {
          canReadAppointments:
            hasManage ||
            hasReadRole(estAccess.roles) ||
            hasAnyPermission(perms, ["scheduling:appointments:read"]),
          canCreateAppointment:
            hasManage ||
            hasAnyPermission(perms, ["scheduling:appointments:create"]),
          canUpdateAppointment:
            hasManage ||
            hasAnyPermission(perms, ["scheduling:appointments:update"]),
          canDeleteAppointment:
            hasManage ||
            hasAnyPermission(perms, ["scheduling:appointments:delete"]),
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
        const allowedEst = findFirstMatchingEstablishment(access.establishments, (item) =>
          hasAnyPermission(item.effectivePermissions, [
            "scheduling:appointments:read",
            "scheduling:appointments:manage",
          ]) || hasReadRole(item.roles),
        );
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
