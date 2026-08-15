import "server-only";

import { BusinessWorkspaceApiGateway } from "@/contexts/business/infrastructure/gateways/business-workspace-api.gateway";
import type { BusinessWorkspaceSelection } from "@/contexts/business/infrastructure/gateways/business-workspace-api.gateway";
import type { BusinessWorkspaceResource } from "@/contexts/business/interfaces/rest/schemas/business-workspace.schemas";
import type {
  OrganizationPageState,
  WorkspaceCapabilities,
  WorkspaceHeaderEstablishment,
  WorkspaceHeaderOrganization,
  WorkspaceHeaderViewModel,
} from "@/contexts/business/application/model/business-workspace.view-models";

export type BusinessWorkspaceQuery = BusinessWorkspaceSelection;

export class BusinessWorkspaceQueryService {
  constructor(private readonly workspace = new BusinessWorkspaceApiGateway()) {}

  async getHeaderViewModel(query: BusinessWorkspaceQuery = {}): Promise<WorkspaceHeaderViewModel> {
    return toHeaderViewModel(await this.workspace.getWorkspace(query));
  }

  async getOrganizationPageState(query: BusinessWorkspaceQuery = {}): Promise<OrganizationPageState> {
    const workspace = toHeaderViewModel(await this.workspace.getWorkspace(query));

    if (!workspace.organization || !workspace.canReadOrganization) {
      return { status: "denied" };
    }

    return {
      status: "ready",
      organization: workspace.organization,
      canUpdate: workspace.organization.canUpdate === true,
    };
  }
}

export function createBusinessWorkspaceQueryService() {
  return new BusinessWorkspaceQueryService();
}

export function toHeaderViewModel(resource: BusinessWorkspaceResource): WorkspaceHeaderViewModel {
  const establishments = resource.establishments
    .filter((establishment) => establishment.permissions.canRead)
    .map(toHeaderEstablishment);
  const organization = resource.organization
    ? toHeaderOrganization(resource.organization, resource.accountType, establishments.length)
    : undefined;
  const activeEstablishmentId = establishments.some(
    (establishment) => establishment.id === resource.activeEstablishmentId,
  )
    ? resource.activeEstablishmentId ?? undefined
    : establishments[0]?.id;

  return {
    accountType: resource.accountType,
    onboardingStatus: resource.onboardingStatus,
    onboardingCompleted: resource.onboardingCompleted,
    ownedOrganizationId: resource.ownedOrganizationId ?? null,
    organization,
    establishments,
    activeEstablishmentId,
    capabilities: toWorkspaceCapabilities(resource.capabilities),
    canReadOrganization: organization?.canRead === true,
    canReadEstablishments: organization?.canReadEstablishments === true,
    canCreateEstablishment: organization?.canCreateEstablishment === true,
    subscription: resource.subscription
      ? {
          active: resource.subscription.active,
          planName: resource.subscription.planName,
          status: resource.subscription.status,
          canManageBilling: resource.subscription.canManageBilling,
        }
      : undefined,
    pendingInvitation: resource.pendingInvitation ?? undefined,
  };
}

function toHeaderOrganization(
  organization: NonNullable<BusinessWorkspaceResource["organization"]>,
  accountType: BusinessWorkspaceResource["accountType"],
  readableEstablishmentCount: number,
): WorkspaceHeaderOrganization {
  // The owner is authorized to attempt creation even when Billing rejects it
  // because the plan limit was reached. The command remains the authoritative
  // business validation boundary and will expose that error.
  const canCreateEstablishment =
    accountType === "OWNER" || organization.permissions.canCreateEstablishment;

  return {
    id: organization.id,
    name: organization.name,
    imageUrl: organization.imageUrl,
    canRead: accountType === "OWNER" || organization.permissions.canRead,
    canUpdate: accountType === "OWNER" || organization.permissions.canUpdate,
    canReadEstablishments: canCreateEstablishment || readableEstablishmentCount > 0,
    canCreateEstablishment,
  };
}

function toHeaderEstablishment(
  establishment: BusinessWorkspaceResource["establishments"][number],
): WorkspaceHeaderEstablishment {
  const effectivePermissions = establishment.effectivePermissions ?? [];

  return {
    id: establishment.id,
    name: establishment.name,
    photoUrl: establishment.photoUrl,
    timeZone: establishment.timeZone ?? null,
    ...(effectivePermissions.length > 0 ? { effectivePermissions } : {}),
    canRead: establishment.permissions.canRead,
    canUpdate: establishment.permissions.canUpdate,
    canDelete: establishment.permissions.canDelete,
    organizationId: establishment.organizationId ?? undefined,
    organizationName: establishment.organizationName ?? undefined,
  };
}

function toWorkspaceCapabilities(
  capabilities: Awaited<ReturnType<BusinessWorkspaceApiGateway["getWorkspace"]>>["capabilities"],
): WorkspaceCapabilities | undefined {
  if (!capabilities) {
    return undefined;
  }

  return {
    canReadAppointments: capabilities.canReadAppointments,
    canReadCatalog: capabilities.canReadCatalog,
    canReadCustomers: capabilities.canReadCustomers,
    canReadTeam: capabilities.canReadTeam,
    canReadAnalytics: capabilities.canReadAnalytics,
  };
}
