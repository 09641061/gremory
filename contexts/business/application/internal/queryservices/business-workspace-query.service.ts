import "server-only";

import { createOrganizationQueryService } from "@/contexts/business/application/internal/queryservices/organization-query.service";
import { createEstablishmentQueryService } from "@/contexts/business/application/internal/queryservices/establishment-query.service";
import { createTeamQueryService } from "@/contexts/workforce/application/internal/queryservices/team-query.service";
import {
  hasAnyPermission,
  hasReadRole,
  pickActiveEstablishment,
} from "@/contexts/shared/application/internal/queryservices/access-context.helpers";
import type {
  OrganizationPageState,
  WorkspaceHeaderOrganization,
  WorkspaceHeaderViewModel,
} from "@/contexts/business/application/model/business-workspace.view-models";

export class BusinessWorkspaceQueryService {
  async getHeaderViewModel(activeEstablishmentId?: string): Promise<WorkspaceHeaderViewModel> {
    try {
      const organization = await createOrganizationQueryService().getMyOrganization();
      const page = await createEstablishmentQueryService().getByOrganization({
        organizationId: organization.id,
        page: 0,
        size: 100,
      });

      const establishments = page.content.map((establishment) => ({
        id: establishment.id,
        name: establishment.name,
        photoUrl: establishment.photoUrl,
      }));

      return {
        organization: {
          id: organization.id,
          name: organization.name,
          imageUrl: organization.imageUrl,
          defaultEstablishmentId: establishments[0]?.id,
        },
        organizations: [
          {
            id: organization.id,
            name: organization.name,
            imageUrl: organization.imageUrl,
            defaultEstablishmentId: establishments[0]?.id,
          },
        ],
        establishments,
        activeEstablishmentId: activeEstablishmentId ?? establishments[0]?.id,
        canReadOrganizations: true,
        canReadEstablishments: true,
        canCreateEstablishment: true,
      };
    } catch {
      try {
        const access = await createTeamQueryService().getAccessContext();
        const activeEstablishment = pickActiveEstablishment(access.establishments, activeEstablishmentId);

        if (!activeEstablishment) {
          return {
            organizations: [],
            establishments: [],
            activeEstablishmentId: undefined,
            canReadOrganizations: false,
            canReadEstablishments: false,
            canCreateEstablishment: false,
          };
        }

        const activeOrganizationId = activeEstablishment.organizationId;
        const organizations = buildOrganizations(access.establishments);
        const establishments = access.establishments
          .filter((item) => item.organizationId === activeOrganizationId)
          .map((item) => ({
            id: item.establishmentId,
            name: item.establishmentName,
            photoUrl: null,
          }));

        return {
          organization:
            organizations.find((item) => item.id === activeOrganizationId) ?? {
              id: activeOrganizationId,
              name: activeEstablishment.organizationName,
              imageUrl: null,
              defaultEstablishmentId: establishments[0]?.id,
            },
          organizations,
          establishments,
          activeEstablishmentId: activeEstablishment.establishmentId,
          canReadOrganizations:
            access.establishments.some(
              (item) =>
                item.organizationId === activeOrganizationId &&
                hasAnyPermission(item.effectivePermissions, [
                  "business:organizations:read",
                  "business:organizations:manage",
                  "business:manage",
                ]),
            ) || hasReadRole(activeEstablishment.roles),
          canReadEstablishments:
            access.establishments.some(
              (item) =>
                item.organizationId === activeOrganizationId &&
                hasAnyPermission(item.effectivePermissions, [
                  "business:establishments:read",
                  "business:establishments:manage",
                  "business:manage",
                ]),
            ) || hasReadRole(activeEstablishment.roles),
          canCreateEstablishment: access.establishments.some(
            (item) =>
              item.organizationId === activeOrganizationId &&
              hasAnyPermission(item.effectivePermissions, [
                "business:establishments:manage",
                "business:manage",
              ]),
          ),
        };
      } catch {
        return {
          organizations: [],
          establishments: [],
          activeEstablishmentId: undefined,
          canReadOrganizations: false,
          canReadEstablishments: false,
          canCreateEstablishment: false,
        };
      }
    }
  }

  async getOrganizationPageState(activeEstablishmentId?: string): Promise<OrganizationPageState> {
    try {
      const organization = await createOrganizationQueryService().getMyOrganization();
      return {
        status: "ready",
        organization,
        canUpdate: true,
      };
    } catch {
      try {
        const access = await createTeamQueryService().getAccessContext();
        const activeEstablishment = pickActiveEstablishment(access.establishments, activeEstablishmentId);

        if (!activeEstablishment) {
          return {
            status: "create",
          };
        }

        const activeOrganizationId = activeEstablishment.organizationId;
        const canRead =
          hasReadRole(activeEstablishment.roles) ||
          access.establishments.some(
            (item) =>
              item.organizationId === activeOrganizationId &&
              hasAnyPermission(item.effectivePermissions, [
                "business:organizations:read",
                "business:organizations:manage",
                "business:manage",
              ]),
          );

        if (!canRead) {
          return {
            status: "denied",
          };
        }

        const organization = await createOrganizationQueryService().getById({
          id: activeOrganizationId,
        });

        return {
          status: "ready",
          organization,
          canUpdate: access.establishments.some(
            (item) =>
              item.organizationId === activeOrganizationId &&
              hasAnyPermission(item.effectivePermissions, [
                "business:organizations:update",
                "business:organizations:manage",
                "business:manage",
              ]),
          ),
        };
      } catch {
        return {
          status: "create",
        };
      }
    }
  }
}

export function createBusinessWorkspaceQueryService() {
  return new BusinessWorkspaceQueryService();
}

function buildOrganizations(
  establishments: ReadonlyArray<{
    organizationId: string;
    organizationName: string;
    establishmentId: string;
  }>,
): ReadonlyArray<WorkspaceHeaderOrganization> {
  const organizations = new Map<string, WorkspaceHeaderOrganization>();

  for (const establishment of establishments) {
    if (!organizations.has(establishment.organizationId)) {
      organizations.set(establishment.organizationId, {
        id: establishment.organizationId,
        name: establishment.organizationName,
        imageUrl: null,
        defaultEstablishmentId: establishment.establishmentId,
      });
    }
  }

  return Array.from(organizations.values());
}
