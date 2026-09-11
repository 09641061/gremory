export type AuthorizationAccountType = "OWNER" | "MEMBER" | "PENDING_INVITATION";

export type AuthorizationScopeType = "ORGANIZATION" | "ESTABLISHMENT" | "NONE";

export interface AuthorizationResource {
  accountType: AuthorizationAccountType;
  scope: AuthorizationScopeResource;
  roles: RoleResource[];
  effectivePermissions: string[];
}

export interface AuthorizationScopeResource {
  type: AuthorizationScopeType;
  organizationId: string | null;
  establishmentId: string | null;
}

export interface RoleResource {
  id: string;
  name: string;
  systemRole: boolean;
  position: number;
  permissions: string[];
}
