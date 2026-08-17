import { createTeamQueryService } from "@/contexts/workforce/application/internal/queryservices/team-query.service";
import {
  hasAnyPermission,
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
        const capabilities = access.membershipCapabilities;
        if (capabilities?.canOpenModules === false) {
          return {
            canReadAppointments: false,
            canCreateAppointment: false,
            canUpdateAppointment: false,
            canDeleteAppointment: false,
          };
        }
        const canReadAppointments =
          capabilities?.canReadAppointments ??
          (hasAnyPermission(perms, ["scheduling:manage"]) ||
            hasAnyPermission(perms, ["scheduling:read"]));
        const canCreateAppointment =
          capabilities?.canCreateAppointment ?? hasAnyPermission(perms, ["scheduling:manage"]);
        const canUpdateAppointment =
          capabilities?.canUpdateAppointment ?? hasAnyPermission(perms, ["scheduling:manage"]);
        const canDeleteAppointment =
          capabilities?.canDeleteAppointment ?? hasAnyPermission(perms, ["scheduling:manage"]);

        return {
          canReadAppointments,
          canCreateAppointment,
          canUpdateAppointment,
          canDeleteAppointment,
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

export function createSchedulingAccessPolicyService() {
  return new SchedulingAccessPolicyService();
}

