import "server-only";

import { BusinessWorkspaceApiGateway } from "@/contexts/business/infrastructure/gateways/business-workspace-api.gateway";
import type { BusinessWorkspaceSelection } from "@/contexts/business/infrastructure/gateways/business-workspace-api.gateway";
import type {
  OrganizationPageState,
  WorkspaceHeaderEstablishment,
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
    const establishments = activeOrganization?.establishments ?? [];
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
    // The owner is authorized to attempt creation even when Billing rejects it
    // because the plan limit was reached. The command/action remains the
    // authoritative business validation boundary and will expose that error.
    canCreateEstablishment:
      activeOrganization?.mode === "OWNER" ||
      activeOrganization?.canCreateEstablishment === true,
    };
  }

  async getOrganizationPageState(query: BusinessWorkspaceQuery = {}): Promise<OrganizationPageState> {
    try {
      const resource = await this.workspace.getWorkspace(query);
      const organizations = resource.organizations.map(toHeaderOrganization);
      const activeOrganization = organizations.find(
        (organization) => organization.id === resource.activeOrganizationId,
      );

      if (activeOrganization && !activeOrganization.canRead) {
        return { status: "denied" };
      }

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
    } catch (error) {
      // Organization creation is authorized by the backend command. A user
      // without an eligible plan/access must still reach the form and see the
      // backend error through the Server Action alert.
      return isForbiddenError(error)
        ? { status: "create" }
        : { status: "denied" };
    }
  }
}

export function createBusinessWorkspaceQueryService() {
  return new BusinessWorkspaceQueryService();
}

function toHeaderOrganization(
  organization: Awaited<ReturnType<BusinessWorkspaceApiGateway["getWorkspace"]>>["organizations"][number],
): WorkspaceHeaderOrganization {
  const establishments = organization.establishments
    .filter((establishment) => establishment.permissions.canRead)
    .map(toHeaderEstablishment);

  return {
    id: organization.id,
    name: organization.name,
    imageUrl: organization.imageUrl,
    mode: organization.mode,
    canRead: organization.permissions.canRead,
    canUpdate: organization.permissions.canUpdate,
    canCreateEstablishment:
      organization.mode === "OWNER" || organization.permissions.canCreateEstablishment,
    defaultEstablishmentId: establishments[0]?.id,
    establishments,
  };
}

function toHeaderEstablishment(
  establishment: Awaited<ReturnType<BusinessWorkspaceApiGateway["getWorkspace"]>>["organizations"][number]["establishments"][number],
): WorkspaceHeaderEstablishment {
  return {
    id: establishment.id,
    name: establishment.name,
    photoUrl: establishment.photoUrl,
    canRead: establishment.permissions.canRead,
    canUpdate: establishment.permissions.canUpdate,
    canDelete: establishment.permissions.canDelete,
  };
}

function isForbiddenError(error: unknown): boolean {
  if (typeof error !== "object" || error === null || !("status" in error)) {
    return false;
  }
  return (error as { status?: unknown }).status === 403;
}
