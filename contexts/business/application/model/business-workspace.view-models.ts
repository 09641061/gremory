export type WorkspaceAccountType = "OWNER" | "MEMBER" | "PENDING_INVITATION";

export type WorkspaceHeaderEstablishment = Readonly<{
  id: string;
  name: string;
  photoUrl?: string | null;
  timeZone?: string | null;
  effectivePermissions?: ReadonlyArray<string>;
  canRead?: boolean;
  canUpdate?: boolean;
  canDelete?: boolean;
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
