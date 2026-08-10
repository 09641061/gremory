export type WorkspaceHeaderEstablishment = Readonly<{
  id: string;
  name: string;
  photoUrl?: string | null;
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
}>;

export type OrganizationPageState =
  | Readonly<{
      status: "create";
    }>
  | Readonly<{
      status: "ready";
      organizations: ReadonlyArray<WorkspaceHeaderOrganization>;
      activeOrganizationId?: string;
    }>
  | Readonly<{
      status: "denied";
    }>;
