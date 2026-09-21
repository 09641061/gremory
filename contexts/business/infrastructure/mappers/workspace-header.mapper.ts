import type { BusinessWorkspaceResource } from "../../application/model/workspace-resource";
import type {
  WorkspaceAccessPolicy,
  WorkspaceAuthorization,
  WorkspaceCapabilities,
  WorkspaceHeaderEstablishment,
  WorkspaceHeaderOrganization,
  WorkspaceHeaderViewModel,
} from "../../application/model/business-workspace.view-models";
import { canCreateOrganization } from "../../domain/services/workspace-navigation.policy";

/**
 * Maps the Application-owned `BusinessWorkspaceResource` view into the
 * consumer-facing `WorkspaceHeaderViewModel`. Lives in Infrastructure so the
 * Application services only consume the view model and never need to
 * traverse resource fields.
 */
export function toHeaderViewModel(
  resource: BusinessWorkspaceResource,
  requestedEstablishmentId?: string,
): WorkspaceHeaderViewModel {
  const allEstablishments = resource.establishments.map(toHeaderEstablishment);
  const establishments = allEstablishments.filter(
    (establishment) =>
      establishment.canRead ||
      establishment.id === requestedEstablishmentId ||
      (resource.accountType === "OWNER" &&
        resource.organization?.id !== undefined &&
        establishment.organizationId === resource.organization.id),
  );
  const organization = resource.organization
    ? toHeaderOrganization(resource.organization, establishments.length)
    : undefined;
  const activeEstablishmentId =
    (requestedEstablishmentId &&
    allEstablishments.some((establishment) => establishment.id === requestedEstablishmentId)
      ? requestedEstablishmentId
      : undefined) ??
    (establishments.some((establishment) => establishment.id === resource.activeEstablishmentId)
      ? resource.activeEstablishmentId ?? undefined
      : establishments[0]?.id);

  return {
    accountType: resource.accountType,
    onboardingStatus: resource.onboardingStatus,
    onboardingCompleted: resource.onboardingCompleted,
    ownedOrganizationId: resource.ownedOrganizationId ?? null,
    organization,
    establishments,
    activeEstablishmentId,
    capabilities: toWorkspaceCapabilities(resource.capabilities),
    authorization: toWorkspaceAuthorization(resource.authorization),
    accessPolicy: toWorkspaceAccessPolicy(resource),
    canReadOrganization: organization?.canRead === true,
    canReadEstablishments: organization?.canReadEstablishments === true,
    canCreateEstablishment: organization?.canCreateEstablishment === true,
    canCreateOrganization: canCreateOrganization(resource.ownedOrganizationId ?? null),
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
  readableEstablishmentCount: number,
): WorkspaceHeaderOrganization {
  const canCreateEstablishment = organization.permissions.canCreateEstablishment;

  return {
    id: organization.id,
    name: organization.name,
    imageUrl: organization.imageUrl,
    canRead: organization.permissions.canRead,
    canUpdate: organization.permissions.canUpdate,
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
    organizationId: establishment.organizationId,
    organizationName: establishment.organizationName,
    organizationImageUrl: establishment.organizationImageUrl ?? null,
  };
}

function toWorkspaceCapabilities(
  capabilities: BusinessWorkspaceResource["capabilities"],
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

function toWorkspaceAuthorization(
  authorization: BusinessWorkspaceResource["authorization"],
): WorkspaceAuthorization | undefined {
  if (
    !authorization ||
    !authorization.scope ||
    !authorization.scope.type ||
    !authorization.scope.id ||
    !authorization.scope.name
  ) {
    return undefined;
  }

  return {
    role: authorization.role,
    scope: {
      type: authorization.scope.type,
      id: authorization.scope.id,
      name: authorization.scope.name,
    },
    capabilities: authorization.capabilities,
  };
}

function toWorkspaceAccessPolicy(resource: BusinessWorkspaceResource): WorkspaceAccessPolicy {
  const capabilities = resource.capabilities ?? {};
  const accessPolicy = resource.accessPolicy ?? {};
  const canCreateEstablishment =
    accessPolicy.canCreateEstablishment ?? resource.organization?.permissions.canCreateEstablishment ?? false;

  return {
    canOpenAnalytics: accessPolicy.canOpenAnalytics ?? capabilities.canReadAnalytics ?? false,
    canOpenScheduling: accessPolicy.canOpenScheduling ?? capabilities.canReadAppointments ?? false,
    canOpenCrm: accessPolicy.canOpenCrm ?? capabilities.canReadCustomers ?? false,
    canOpenCatalog: accessPolicy.canOpenCatalog ?? capabilities.canReadCatalog ?? false,
    canOpenTeam: accessPolicy.canOpenTeam ?? capabilities.canReadTeam ?? false,
    canUseAssistant: accessPolicy.canUseAssistant,
    canCreateEstablishment,
    canManageBilling: accessPolicy.canManageBilling ?? resource.subscription?.canManageBilling ?? false,
  };
}
