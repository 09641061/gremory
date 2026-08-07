import type { OrganizationSummary } from "./business.read-models";

export type WorkspaceHeaderOrganization = Readonly<{
  id: string;
  name: string;
  imageUrl?: string | null;
  defaultEstablishmentId?: string;
}>;

export type WorkspaceHeaderEstablishment = Readonly<{
  id: string;
  name: string;
  photoUrl?: string | null;
}>;

export type WorkspaceHeaderViewModel = Readonly<{
  organization?: WorkspaceHeaderOrganization;
  organizations: ReadonlyArray<WorkspaceHeaderOrganization>;
  establishments: ReadonlyArray<WorkspaceHeaderEstablishment>;
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
      organization: OrganizationSummary;
      canUpdate: boolean;
    }>
  | Readonly<{
      status: "denied";
    }>;
