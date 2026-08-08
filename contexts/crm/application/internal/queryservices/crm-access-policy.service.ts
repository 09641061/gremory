import { createTeamQueryService } from "@/contexts/workforce/application/internal/queryservices/team-query.service";
import { createOrganizationQueryService } from "@/contexts/business/application/internal/queryservices/organization-query.service";
import { createEstablishmentQueryService } from "@/contexts/business/application/internal/queryservices/establishment-query.service";
import {
  findFirstMatchingEstablishment,
  hasAnyPermission,
  hasReadRole,
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
      // If user is owner, they have full permissions
      await createOrganizationQueryService().getMyOrganization();
      return {
        canReadCustomers: true,
        canCreateCustomer: true,
        canUpdateCustomer: true,
        canDeleteCustomer: true,
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
            canReadCustomers: false,
            canCreateCustomer: false,
            canUpdateCustomer: false,
            canDeleteCustomer: false,
          };
        }

        const perms = estAccess.effectivePermissions;
        const hasManage = hasAnyPermission(perms, ["crm:customers:manage"]);

        return {
          canReadCustomers:
            hasManage ||
            hasReadRole(estAccess.roles) ||
            hasAnyPermission(perms, ["crm:customers:read"]),
          canCreateCustomer:
            hasManage ||
            hasAnyPermission(perms, ["crm:customers:create"]),
          canUpdateCustomer:
            hasManage ||
            hasAnyPermission(perms, ["crm:customers:update"]),
          canDeleteCustomer:
            hasManage ||
            hasAnyPermission(perms, ["crm:customers:delete"]),
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
            "crm:customers:read",
            "crm:customers:manage",
          ]) || hasReadRole(item.roles),
        );
        return allowedEst?.establishmentId;
      } catch {
        return undefined;
      }
    }
  }
}

export function createCrmAccessPolicyService() {
  return new CrmAccessPolicyService();
}
