export type WorkforceInvitation = Readonly<{
  id: string;
  organizationId: string;
  organizationName: string;
  establishmentId: string;
  establishmentName: string;
  email: string;
  role: WorkforceRoleSummary;
  status: "PENDING";
  createdAt: string;
  expiresAt: string;
}>;

export type WorkforceInvitationPreview = Readonly<{
  organizationId: string;
  organizationName: string;
  establishmentId: string;
  establishmentName: string;
  maskedEmail: string;
  recipientRegistered: boolean;
  expiresAt: string;
}>;

export type WorkforceMember = Readonly<{
  id: string;
  organizationId: string;
  establishmentId: string;
  establishmentName: string;
  userId: string;
  email: string;
  role: WorkforceRoleSummary | null;
  joinedAt: string;
}>;

export type WorkforcePermissionScope = "SELF" | "ESTABLISHMENT" | "ORGANIZATION";

export type WorkforcePermissionGrant = Readonly<{
  permissionKey: string;
  scope: WorkforcePermissionScope;
}>;

export type WorkforcePermissionDefinition = Readonly<{
  key: string;
  group: string;
  label: string;
  description: string;
  allowedScopes: readonly WorkforcePermissionScope[];
  sensitive: boolean;
  dependencies: readonly string[];
}>;

export type WorkforceRoleSummary = Readonly<{
  id: string;
  name: string;
  status: "ACTIVE" | "ARCHIVED";
}>;

export type WorkforceRole = Readonly<{
  id: string;
  organizationId: string;
  name: string;
  description: string | null;
  status: "ACTIVE" | "ARCHIVED";
  version: number;
  selectedGrants: readonly WorkforcePermissionGrant[];
  effectiveGrants: readonly WorkforcePermissionGrant[];
  activeMemberCount: number;
  pendingInvitationCount: number;
  updatedAt: string;
}>;

export type SaveWorkforceRole = Readonly<{
  name: string;
  description?: string;
  selectedGrants: readonly WorkforcePermissionGrant[];
  version?: number;
}>;

export type AcceptedWorkforceInvitation = Readonly<{
  organizationId: string;
  establishmentId: string;
}>;
