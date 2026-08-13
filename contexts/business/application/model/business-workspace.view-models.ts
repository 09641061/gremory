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

export type WorkspaceHeaderOrganization = Readonly<{
  id: string;
  name: string;
  imageUrl?: string | null;
  defaultEstablishmentId?: string;
  mode?: "OWNER" | "MEMBER";
  canRead?: boolean;
  canUpdate?: boolean;
  canReadEstablishments?: boolean;
  canCreateEstablishment?: boolean;
  establishments: ReadonlyArray<WorkspaceHeaderEstablishment>;
}>;

export type WorkspaceHeaderViewModel = Readonly<{
  organization?: WorkspaceHeaderOrganization;
  organizations: ReadonlyArray<WorkspaceHeaderOrganization>;
  establishments: ReadonlyArray<WorkspaceHeaderEstablishment>;
  activeOrganizationId?: string;
  activeEstablishmentId?: string;
  canReadOrganizations: boolean;
  canReadEstablishments: boolean;
  canCreateEstablishment: boolean;
  canCreateOrganization: boolean;
}>;

export type OrganizationPageState =
  | Readonly<{
      status: "create";
    }>
  | Readonly<{
      status: "ready";
      organizations: ReadonlyArray<WorkspaceHeaderOrganization>;
      activeOrganizationId?: string;
      canCreateOrganization: boolean;
    }>
  | Readonly<{
      status: "denied";
    }>;

export type OrganizationCreationState = Readonly<{
  status: "allowed" | "denied";
}>;
