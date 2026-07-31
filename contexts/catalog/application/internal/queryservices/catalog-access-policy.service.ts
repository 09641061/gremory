import { createTeamQueryService } from "@/contexts/workforce/application/internal/queryservices/team-query.service";
import { createOrganizationQueryService } from "@/contexts/business/application/internal/queryservices/organization-query.service";

export interface CatalogPermissions {
  canReadCatalog: boolean;
  canCreateCategory: boolean;
  canUpdateCategory: boolean;
  canDeleteCategory: boolean;
  canCreateService: boolean;
  canUpdateService: boolean;
  canDeleteService: boolean;
}

export class CatalogAccessPolicyService {
  async getPermissions(establishmentId?: string): Promise<CatalogPermissions> {
    if (!establishmentId) {
      return {
        canReadCatalog: false,
        canCreateCategory: false,
        canUpdateCategory: false,
        canDeleteCategory: false,
        canCreateService: false,
        canUpdateService: false,
        canDeleteService: false,
      };
    }

    try {
      // If user is owner, they have full permissions
      await createOrganizationQueryService().getMyOrganization();
      return {
        canReadCatalog: true,
        canCreateCategory: true,
        canUpdateCategory: true,
        canDeleteCategory: true,
        canCreateService: true,
        canUpdateService: true,
        canDeleteService: true,
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
            canReadCatalog: false,
            canCreateCategory: false,
            canUpdateCategory: false,
            canDeleteCategory: false,
            canCreateService: false,
            canUpdateService: false,
            canDeleteService: false,
          };
        }

        const perms = estAccess.effectivePermissions;
        const hasManage = perms.includes("catalog:manage");
        const roles = estAccess.roles || [];
        const hasReadRole = roles.some((role) => role.name.toLowerCase() === "read");

        return {
          canReadCatalog:
            hasManage ||
            hasReadRole ||
            perms.includes("catalog:services:read") ||
            perms.includes("catalog:categories:read"),
          canCreateCategory:
            hasManage ||
            perms.includes("catalog:categories:create") ||
            perms.includes("catalog:categories:manage"),
          canUpdateCategory:
            hasManage ||
            perms.includes("catalog:categories:update") ||
            perms.includes("catalog:categories:manage"),
          canDeleteCategory:
            hasManage ||
            perms.includes("catalog:categories:delete") ||
            perms.includes("catalog:categories:manage"),
          canCreateService:
            hasManage ||
            perms.includes("catalog:services:create") ||
            perms.includes("catalog:services:manage"),
          canUpdateService:
            hasManage ||
            perms.includes("catalog:services:update") ||
            perms.includes("catalog:services:manage"),
          canDeleteService:
            hasManage ||
            perms.includes("catalog:services:delete") ||
            perms.includes("catalog:services:manage"),
        };
      } catch {
        return {
          canReadCatalog: false,
          canCreateCategory: false,
          canUpdateCategory: false,
          canDeleteCategory: false,
          canCreateService: false,
          canUpdateService: false,
          canDeleteService: false,
        };
      }
    }
  }

  async getDefaultEstablishmentId(): Promise<string | undefined> {
    try {
      const access = await createTeamQueryService().getAccessContext();
      const allowedEst = access.establishments.find((item) => {
        const roles = item.roles || [];
        const hasReadRole = roles.some((role) => role.name.toLowerCase() === "read");
        return (
          item.effectivePermissions.some(
            (perm) =>
              perm === "catalog:services:read" ||
              perm === "catalog:categories:read" ||
              perm === "catalog:manage",
          ) || hasReadRole
        );
      });
      return allowedEst?.establishmentId;
    } catch {
      return undefined;
    }
  }
}

export function createCatalogAccessPolicyService() {
  return new CatalogAccessPolicyService();
}
