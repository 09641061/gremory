import "server-only";

import { BusinessWorkspaceApiGateway } from "@/contexts/business/infrastructure/gateways/business-workspace-api.gateway";
import type { BusinessWorkspaceSelection } from "@/contexts/business/infrastructure/gateways/business-workspace-api.gateway";
import type {
  OrganizationPageState,
  WorkspaceHeaderOrganization,
  WorkspaceHeaderViewModel,
} from "@/contexts/business/application/model/business-workspace.view-models";

export type BusinessWorkspaceQuery = BusinessWorkspaceSelection;

export class BusinessWorkspaceQueryService {
  constructor(private readonly workspace = new BusinessWorkspaceApiGateway()) {}

  async getHeaderViewModel(query: BusinessWorkspaceQuery = {}): Promise<WorkspaceHeaderViewModel> {
    const resource = await this.workspace.getWorkspace(query);
    const organizations = resource.organizations.map(toHeaderOrganization);
    const activeOrganization = organizations.find(
      (organization) => organization.id === resource.activeOrganizationId,
    );
    const activeResource = resource.organizations.find(
      (organization) => organization.id === resource.activeOrganizationId,
    );
    const establishments = activeResource?.establishments
      .filter((establishment) => establishment.permissions.canRead)
      .map((establishment) => ({
      id: establishment.id,
      name: establishment.name,
      photoUrl: establishment.photoUrl,
      canRead: establishment.permissions.canRead,
      canUpdate: establishment.permissions.canUpdate,
      canDelete: establishment.permissions.canDelete,
      })) ?? [];
    const activeEstablishmentId = establishments.some(
      (establishment) => establishment.id === resource.activeEstablishmentId,
    )
      ? resource.activeEstablishmentId ?? undefined
      : undefined;

    return {
      organization: activeOrganization,
      organizations,
      establishments,
      activeOrganizationId: resource.activeOrganizationId ?? undefined,
      activeEstablishmentId,
      canReadOrganizations: organizations.some((organization) => organization.canRead),
      canReadEstablishments:
        activeOrganization?.mode === "OWNER" ||
        activeOrganization?.canCreateEstablishment === true ||
        establishments.some((establishment) => establishment.canRead),
      canCreateEstablishment: activeOrganization?.canCreateEstablishment ?? false,
    };
  }

  async getOrganizationPageState(query: BusinessWorkspaceQuery = {}): Promise<OrganizationPageState> {
    try {
      const resource = await this.workspace.getWorkspace(query);
      const organizations = resource.organizations.map(toHeaderOrganization);
      const readableOrganizations = organizations.filter((organization) => organization.canRead);

      if (readableOrganizations.length === 0) {
        return resource.organizations.length === 0
          ? { status: "create" }
          : { status: "denied" };
      }

      return {
        status: "ready",
        organizations: readableOrganizations,
        activeOrganizationId: resource.activeOrganizationId ?? undefined,
      };
    } catch {
      return { status: "denied" };
    }
  }
}

export function createBusinessWorkspaceQueryService() {
  return new BusinessWorkspaceQueryService();
}

function toHeaderOrganization(
  organization: Awaited<ReturnType<BusinessWorkspaceApiGateway["getWorkspace"]>>["organizations"][number],
): WorkspaceHeaderOrganization {
  return {
    id: organization.id,
    name: organization.name,
    imageUrl: organization.imageUrl,
    mode: organization.mode,
    canRead: organization.permissions.canRead,
    canUpdate: organization.permissions.canUpdate,
    canCreateEstablishment: organization.permissions.canCreateEstablishment,
    defaultEstablishmentId: organization.establishments[0]?.id,
  };
}
