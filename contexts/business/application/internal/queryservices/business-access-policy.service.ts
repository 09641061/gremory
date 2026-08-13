import { createOrganizationQueryService } from "@/contexts/business/application/internal/queryservices/organization-query.service";
import { createEstablishmentQueryService } from "@/contexts/business/application/internal/queryservices/establishment-query.service";
import { createTeamQueryService } from "@/contexts/workforce/application/internal/queryservices/team-query.service";
import type { OrganizationSummary } from "@/contexts/business/application/model/business.read-models";
import { hasAnyPermission, hasReadRole, pickActiveEstablishment } from "@/contexts/shared/application/internal/queryservices/access-context.helpers";

export interface BusinessPermissions {
  isOwner: boolean;
  canRead: boolean;
  canCreate: boolean;
  canUpdateMap: Record<string, boolean>;
  allowedEstablishments: { id: string; name: string; photoUrl: string | null; timeZone: string | null }[];
}

export class BusinessAccessPolicyService {
  async getEstablishmentsPermissions(activeEstablishmentId?: string): Promise<BusinessPermissions> {
    let organizationId = "";
    let isOwner = true;
    const canUpdateMap: Record<string, boolean> = {};

    try {
      const organization = await createOrganizationQueryService().getMyOrganization();
      organizationId = organization.id;
    } catch {
      isOwner = false;
    }

    // Verify if the active establishment belongs to the organization owned by this user
    if (isOwner && activeEstablishmentId) {
      try {
        const page = await createEstablishmentQueryService().getByOrganization({
          organizationId,
          page: 0,
          size: 100,
        });
        const belongsToOwnerOrg = page.content.some((est) => est.id === activeEstablishmentId);
        if (!belongsToOwnerOrg) {
          isOwner = false; // User is acting as an employee for the active organization
        }
      } catch {
        isOwner = false;
      }
    }

    if (isOwner) {
      try {
        const page = await createEstablishmentQueryService().getByOrganization({
          organizationId,
          page: 0,
          size: 100,
        });

        page.content.forEach((est) => {
          canUpdateMap[est.id] = true;
        });

        return {
          isOwner: true,
          canRead: true,
          canCreate: true,
          canUpdateMap,
          allowedEstablishments: page.content.map((est) => ({
            id: est.id,
            name: est.name,
            photoUrl: est.photoUrl,
            timeZone: est.timeZone,
          })),
        };
      } catch {
        return {
          isOwner: true,
          canRead: false,
          canCreate: true,
          canUpdateMap: {},
          allowedEstablishments: [],
        };
      }
    } else {
      try {
        const access = await createTeamQueryService().getAccessContext();

        // 1. Resolve active organization from activeEstablishmentId
        const activeEst = pickActiveEstablishment(access.establishments, activeEstablishmentId);

        if (!activeEst) {
          return {
            isOwner: false,
            canRead: false,
            canCreate: false,
            canUpdateMap: {},
            allowedEstablishments: [],
          };
        }

        const activeOrgId = activeEst.organizationId;

        // 2. Determine if the user has permission to read establishments in the active organization
        const canRead =
          hasReadRole(activeEst.roles) ||
          access.establishments.some(
            (item) =>
              item.organizationId === activeOrgId &&
              hasAnyPermission(item.effectivePermissions, [
                "business:read",
                "business:manage",
              ]),
          );

        // Determine if they can create establishments
        const canCreate = access.establishments.some(
          (item) =>
            item.organizationId === activeOrgId &&
            hasAnyPermission(item.effectivePermissions, [
              "business:manage",
            ]),
        );

        // 3. Get all establishments of the active organization that the user is a member of
        const filteredEsts = access.establishments.filter(
          (item) => item.organizationId === activeOrgId
        );

        const allowedEstablishments = filteredEsts.map((item) => {
          const canUpdate = hasAnyPermission(item.effectivePermissions, [
            "business:manage",
          ]);
          canUpdateMap[item.establishmentId] = canUpdate;

          return {
            id: item.establishmentId,
            name: item.establishmentName,
            photoUrl: null,
            timeZone: null,
          };
        });

        return {
          isOwner: false,
          canRead: canRead && allowedEstablishments.length > 0,
          canCreate,
          canUpdateMap,
          allowedEstablishments,
        };
      } catch {
        return {
          isOwner: false,
          canRead: false,
          canCreate: false,
          canUpdateMap: {},
          allowedEstablishments: [],
        };
      }
    }
  }

  async getOrganizationPermissions(activeEstablishmentId?: string): Promise<{ canRead: boolean; canUpdate: boolean; organization: OrganizationSummary | null }> {
    let organization: OrganizationSummary | null = null;
    let canUpdate = true;
    let canRead = true;
    let isOwner = true;

    try {
      organization = await createOrganizationQueryService().getMyOrganization();
    } catch {
      isOwner = false;
    }

    // Verify if the active establishment belongs to the organization owned by this user
    if (isOwner && activeEstablishmentId && organization) {
      try {
        const page = await createEstablishmentQueryService().getByOrganization({
          organizationId: organization.id,
          page: 0,
          size: 100,
        });
        const belongsToOwnerOrg = page.content.some((est) => est.id === activeEstablishmentId);
        if (!belongsToOwnerOrg) {
          isOwner = false; // User is acting as an employee for the active organization
        }
      } catch {
        isOwner = false;
      }
    }

    if (isOwner && organization) {
      return {
        canRead: true,
        canUpdate: true,
        organization,
      };
    } else {
      canUpdate = false;
      try {
        const access = await createTeamQueryService().getAccessContext();

        // Resolve active establishment
        const activeEst = pickActiveEstablishment(access.establishments, activeEstablishmentId);

        if (activeEst) {
          const activeOrgId = activeEst.organizationId;
          canRead =
            hasReadRole(activeEst.roles) ||
            access.establishments.some(
              (item) =>
                item.organizationId === activeOrgId &&
                hasAnyPermission(item.effectivePermissions, [
                  "business:read",
                  "business:manage",
                ]),
            );

          if (canRead) {
            organization = await createOrganizationQueryService().getById({
              id: activeOrgId,
            });

            canUpdate = access.establishments.some(
              (item) =>
                item.organizationId === activeOrgId &&
                hasAnyPermission(item.effectivePermissions, [
                  "business:manage",
                ]),
            );
          }
        } else {
          canRead = false;
        }

        return {
          canRead,
          canUpdate,
          organization,
        };
      } catch {
        return {
          canRead: false,
          canUpdate: false,
          organization: null,
        };
      }
    }
  }
}

export function createBusinessAccessPolicyService() {
  return new BusinessAccessPolicyService();
}
