import { createTeamQueryService } from "@/contexts/workforce/application/internal/queryservices/team-query.service";
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

export function createCrmAccessPolicyService() {
  return new CrmAccessPolicyService();
}

