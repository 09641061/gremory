import { createTeamQueryService } from "@/contexts/workforce/application/internal/queryservices/team-query.service";
import { createOrganizationQueryService } from "@/contexts/business/application/internal/queryservices/organization-query.service";
import { createEstablishmentQueryService } from "@/contexts/business/application/internal/queryservices/establishment-query.service";

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

        const perms = estAccess.effectivePermissions ?? [];
        const hasReadCatalog = hasCatalogReadPermission(perms);
        const hasManage = perms.includes("catalog:manage");

        return {
          canReadCatalog: hasReadCatalog,
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
        if (!access.active) {
          return undefined;
        }
        const allowedEst = access.establishments.find((item) => {
          return hasCatalogReadPermission(item.effectivePermissions ?? []);
        });
        return allowedEst?.establishmentId;
      } catch {
        return undefined;
      }
    }
  }
}

export function createCatalogAccessPolicyService() {
  return new CatalogAccessPolicyService();
}

function hasCatalogReadPermission(permissions: ReadonlyArray<string>): boolean {
  return permissions.some(
    (permission) =>
      permission === "catalog:manage" ||
      permission === "catalog:services:read" ||
      permission === "catalog:categories:read",
  );
}
