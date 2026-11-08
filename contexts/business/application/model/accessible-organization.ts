/**
 * Application-owned view of an organization the account can see (owned or
 * joined via membership). Mirrors the shape the backend returns; the
 * Infrastructure schema is the runtime source of truth.
 */

export type AccessibleOrganizationPermissions = Readonly<{
  canRead: boolean;
  canUpdate: boolean;
  canCreateEstablishment: boolean;
}>;

export type AccessibleOrganizationEstablishment = Readonly<{
  id: string;
  name: string;
  photoUrl?: string | null;
  timeZone?: string | null;
  permissions?: {
    canRead: boolean;
    canUpdate: boolean;
    canDelete: boolean;
  };
  effectivePermissions: ReadonlyArray<string>;
}>;

export type AccessibleOrganizationView = Readonly<{
  id: string;
  name: string;
  imageUrl: string | null;
  isOwned: boolean;
  permissions: AccessibleOrganizationPermissions;
  establishments: ReadonlyArray<AccessibleOrganizationEstablishment>;
}>;
