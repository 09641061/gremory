import { createTeamQueryService } from "@/contexts/workforce/application/internal/queryservices/team-query.service";
import { createOrganizationQueryService } from "@/contexts/business/application/internal/queryservices/organization-query.service";
import { createEstablishmentQueryService } from "@/contexts/business/application/internal/queryservices/establishment-query.service";
import {
  hasAnyPermission,
} from "@/contexts/shared/application/internal/queryservices/access-context.helpers";

export interface CrmPermissions {
  canReadCustomers: boolean;
  canCreateCustomer: boolean;
  canUpdateCustomer: boolean;
  canDeleteCustomer: boolean;
}

export class CrmAccessPolicyService {
  async getPermissions(establishmentId?: string): Promise<CrmPermissions> {
    if (!establishmentId) {
      return {
        canReadCustomers: false,
        canCreateCustomer: false,
        canUpdateCustomer: false,
        canDeleteCustomer: false,
      };
    }

    try {
      if (await ownsEstablishment(establishmentId)) {
      return {
        canReadCustomers: true,
        canCreateCustomer: true,
        canUpdateCustomer: true,
        canDeleteCustomer: true,
      };
      }
    } catch {
      // Resolve member permissions below.
    }
    try {
        const access = await createTeamQueryService().getAccessContext();
        const estAccess = access.establishments.find(
          (item) => item.establishmentId === establishmentId,
        );
        if (!estAccess) {
          return {
            canReadCustomers: false,
            canCreateCustomer: false,
            canUpdateCustomer: false,
            canDeleteCustomer: false,
          };
        }

        const perms = estAccess.effectivePermissions;
        const hasManage = hasAnyPermission(perms, ["crm:manage"]);
        if (access.membershipCapabilities?.canOpenModules === false) {
          return {
            canReadCustomers: false,
            canCreateCustomer: false,
            canUpdateCustomer: false,
            canDeleteCustomer: false,
          };
        }

        return {
          canReadCustomers:
            hasManage ||
            hasReadRole(estAccess.roles) ||
            hasAnyPermission(perms, ["crm:read"]),
          canCreateCustomer: hasManage,
          canUpdateCustomer: hasManage,
          canDeleteCustomer: hasManage,
        };
      } catch {
        return {
          canReadCustomers: false,
          canCreateCustomer: false,
          canUpdateCustomer: false,
          canDeleteCustomer: false,
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
export function createCrmAccessPolicyService() {
  return new CrmAccessPolicyService();
}

function hasReadRole(roles?: ReadonlyArray<{ name: string }>): boolean {
  return roles?.some((role) => role.name.toLowerCase() === "read") ?? false;
}
