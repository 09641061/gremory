import { createTeamQueryService } from "@/contexts/workforce/application/internal/queryservices/team-query.service";
import {
  hasAnyPermission,
} from "@/contexts/shared/application/internal/queryservices/access-context.helpers";

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
        const hasManage = hasAnyPermission(perms, ["catalog:manage"]);
        if (access.membershipCapabilities?.canOpenModules === false) {
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

        return {
          canReadCatalog: hasReadCatalog,
          canCreateCategory: hasManage,
          canUpdateCategory: hasManage,
          canDeleteCategory: hasManage,
          canCreateService: hasManage,
          canUpdateService: hasManage,
          canDeleteService: hasManage,
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

export function createCatalogAccessPolicyService() {
  return new CatalogAccessPolicyService();
}

function hasCatalogReadPermission(permissions: ReadonlyArray<string>): boolean {
  return permissions.some(
    (permission) =>
      permission === "catalog:manage" ||
      permission === "catalog:read",
  );
}
