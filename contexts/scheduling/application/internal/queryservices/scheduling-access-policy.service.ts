import { createTeamQueryService } from "@/contexts/workforce/application/internal/queryservices/team-query.service";
import { createOrganizationQueryService } from "@/contexts/business/application/internal/queryservices/organization-query.service";
import { createEstablishmentQueryService } from "@/contexts/business/application/internal/queryservices/establishment-query.service";
import {
  hasAnyPermission,
} from "@/contexts/shared/application/internal/queryservices/access-context.helpers";
import { workforcePermissions } from "@/contexts/workforce/domain/model/enums/workforce-permission";

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
      // A personal organization is not enough to prove that this establishment
      // belongs to the owner. A user may also be a member of another organization.
      if (await ownsEstablishment(establishmentId)) {
      return {
        canReadAppointments: true,
        canCreateAppointment: true,
        canUpdateAppointment: true,
        canDeleteAppointment: true,
      };
      }
    } catch {
      // Resolve member permissions below.
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
        const hasManage = hasAnyPermission(perms, [
          workforcePermissions.scheduling.manage,
        ]);

        return {
          canReadAppointments:
            hasManage ||
            hasAnyPermission(perms, [workforcePermissions.scheduling.read]),
          canCreateAppointment: hasManage,
          canUpdateAppointment: hasManage,
          canDeleteAppointment: hasManage,
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

async function ownsEstablishment(establishmentId: string): Promise<boolean> {
  try {
    const organization = await createOrganizationQueryService().getMyOrganization();
    const page = await createEstablishmentQueryService().getByOrganization({
      organizationId: organization.id,
      page: 0,
      size: 100,
    });
    return page ? page.content.some((establishment) => establishment.id === establishmentId) : true;
  } catch {
    return false;
  }
}
export function createSchedulingAccessPolicyService() {
  return new SchedulingAccessPolicyService();
}
