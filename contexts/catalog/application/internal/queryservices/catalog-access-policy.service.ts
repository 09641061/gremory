import { createTeamQueryService } from "@/contexts/workforce/application/internal/queryservices/team-query.service";
import { createOrganizationQueryService } from "@/contexts/business/application/internal/queryservices/organization-query.service";
import { createEstablishmentQueryService } from "@/contexts/business/application/internal/queryservices/establishment-query.service";
import {
  hasAnyPermission,
} from "@/contexts/shared/application/internal/queryservices/access-context.helpers";
import { workforcePermissions } from "@/contexts/workforce/domain/model/enums/workforce-permission";

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
      if (await ownsEstablishment(establishmentId)) {
      return {
        canReadCatalog: true,
        canCreateCategory: true,
        canUpdateCategory: true,
        canDeleteCategory: true,
        canCreateService: true,
        canUpdateService: true,
        canDeleteService: true,
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
        const hasManage = hasAnyPermission(perms, [workforcePermissions.catalog.manage]);

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
export function createCatalogAccessPolicyService() {
  return new CatalogAccessPolicyService();
}

function hasCatalogReadPermission(permissions: ReadonlyArray<string>): boolean {
  return hasAnyPermission(permissions, [
    workforcePermissions.catalog.read,
    workforcePermissions.catalog.manage,
  ]);
}
