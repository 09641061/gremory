/**
 * Application-owned workspace resource view.
 *
 * Mirrors the runtime contract validated by the Infrastructure gateway. The
 * gateway parses the response with Zod and returns this shape; Application
 * never depends on the Zod schema or the Infrastructure types.
 */

export type BusinessWorkspaceResource = {
  accountType: "OWNER" | "MEMBER" | "PENDING_INVITATION";
  onboardingStatus:
    | "ORGANIZATION_PENDING"
    | "ESTABLISHMENT_PENDING"
    | "PAYMENT_PENDING"
    | "COMPLETED"
    | null;
  onboardingCompleted: boolean;
  organization: {
    id: string;
    name: string;
    imageUrl: string | null;
    permissions: {
      canRead: boolean;
      canUpdate: boolean;
      canCreateEstablishment: boolean;
    };
  } | null;
  establishments: BusinessWorkspaceEstablishmentResource[];
  activeEstablishmentId: string | null;
  capabilities?: {
    canReadAppointments?: boolean;
    canReadCatalog?: boolean;
    canReadCustomers?: boolean;
    canReadTeam?: boolean;
    canReadAnalytics?: boolean;
  } | null;
  authorization?: {
    role: "OWNER" | "MANAGER" | "WORKER";
    scope?: {
      type?: "ORGANIZATION" | "ESTABLISHMENT" | null;
      id?: string | null;
      name?: string | null;
    } | null;
    capabilities: {
      canEditOrganizationProfile: boolean;
      canEditEstablishmentProfile: boolean;
      canManageMembers: boolean;
      canManageBilling: boolean;
      canOpenModules: boolean;
      canInviteUsers: boolean;
    };
  } | null;
  accessPolicy?: {
    canOpenAnalytics?: boolean;
    canOpenScheduling?: boolean;
    canOpenCrm?: boolean;
    canOpenCatalog?: boolean;
    canOpenTeam?: boolean;
    canUseAssistant?: boolean;
    canCreateEstablishment?: boolean;
    canManageBilling?: boolean;
  } | null;
  subscription?: {
    active: boolean;
    planName: string | null;
    status: string | null;
    canManageBilling: boolean;
  } | null;
  pendingInvitation?: {
    establishmentId: string;
    organizationName: string;
    establishmentName: string;
    expiresAt: string;
  } | null;
  ownedOrganizationId?: string | null;
};

export type BusinessWorkspaceEstablishmentResource = {
  id: string;
  name: string;
  photoUrl: string | null;
  timeZone?: string | null;
  effectivePermissions: string[];
  permissions: {
    canRead: boolean;
    canUpdate: boolean;
    canDelete: boolean;
  };
  organizationId?: string;
  organizationName?: string;
  organizationImageUrl?: string | null;
};
