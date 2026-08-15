export type WorkspaceAccountType = "OWNER" | "MEMBER" | "PENDING_INVITATION";

export type WorkspaceOnboardingStatus =
  | "ORGANIZATION_PENDING"
  | "ESTABLISHMENT_PENDING"
  | "COMPLETED";

export type WorkspaceHeaderEstablishment = Readonly<{
  id: string;
  name: string;
  photoUrl?: string | null;
  timeZone?: string | null;
  effectivePermissions?: ReadonlyArray<string>;
  canRead?: boolean;
  canUpdate?: boolean;
  canDelete?: boolean;
  organizationId?: string;
  organizationName?: string;
  organizationImageUrl?: string | null;
}>;

export type WorkspaceCapabilities = Readonly<{
  canReadAppointments?: boolean;
  canReadCatalog?: boolean;
  canReadCustomers?: boolean;
  canReadTeam?: boolean;
  canReadAnalytics?: boolean;
}>;

export type WorkspaceHeaderOrganization = Readonly<{
  id: string;
  name: string;
  imageUrl?: string | null;
  canRead?: boolean;
  canUpdate?: boolean;
  canReadEstablishments?: boolean;
  canCreateEstablishment?: boolean;
}>;

/**
 * The owner's subscription, which every account in the organization depends on.
 * A member reads `active` to know it is suspended but can never manage it.
 */
export type WorkspaceSubscription = Readonly<{
  active: boolean;
  planName?: string | null;
  status?: string | null;
  canManageBilling: boolean;
}>;

export type WorkspacePendingInvitation = Readonly<{
  organizationName: string;
  establishmentName: string;
  expiresAt: string;
}>;

/**
 * The header renders from `accountType`, `effectivePermissions` and
 * `subscription.active`. It never infers the role from the session token.
 */
export type WorkspaceHeaderViewModel = Readonly<{
  accountType: WorkspaceAccountType;
  onboardingStatus: WorkspaceOnboardingStatus | null;
  onboardingCompleted: boolean;
  // The organization this account owns, independent of which one is active.
  // Null while it owns none - e.g. a member who has not started their own
  // business yet. Compare against an establishment's/org's id to tell "mine"
  // apart from "foreign" regardless of which context is currently active.
  ownedOrganizationId: string | null;
  organization?: WorkspaceHeaderOrganization;
  establishments: ReadonlyArray<WorkspaceHeaderEstablishment>;
  activeEstablishmentId?: string;
  capabilities?: WorkspaceCapabilities;
  canReadOrganization: boolean;
  canReadEstablishments: boolean;
  canCreateEstablishment: boolean;
  subscription?: WorkspaceSubscription;
  pendingInvitation?: WorkspacePendingInvitation;
}>;

export type OrganizationPageState =
  | Readonly<{
      status: "ready";
      organization: WorkspaceHeaderOrganization;
      canUpdate: boolean;
    }>
  | Readonly<{ status: "denied" }>;
