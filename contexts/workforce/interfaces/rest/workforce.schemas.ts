import { z } from "zod";

const uuid = z.string().uuid();
const instant = z.string().datetime({ offset: true });
export const workforcePermissionScopeSchema = z.enum(["SELF", "ESTABLISHMENT", "ORGANIZATION"]);
export const workforceRoleSummarySchema = z.object({
  id: uuid,
  name: z.string().min(2).max(50),
  status: z.enum(["ACTIVE", "ARCHIVED"]),
});
export const workforcePermissionGrantSchema = z.object({
  permissionKey: z.string().min(1).max(96),
  scope: workforcePermissionScopeSchema,
});

export const workforceInvitationSchema = z.object({
  id: uuid,
  organizationId: uuid,
  organizationName: z.string().min(1),
  establishmentId: uuid,
  establishmentName: z.string().min(1),
  email: z.string().email(),
  role: workforceRoleSummarySchema,
  status: z.literal("PENDING"),
  createdAt: instant,
  expiresAt: instant,
});

export const workforceInvitationListSchema = z.array(workforceInvitationSchema);

export const workforceInvitationPreviewSchema = z.object({
  organizationId: uuid,
  organizationName: z.string().min(1),
  establishmentId: uuid,
  establishmentName: z.string().min(1),
  maskedEmail: z.string().min(1),
  recipientRegistered: z.boolean(),
  expiresAt: instant,
});

export const workforceMemberSchema = z.object({
  id: uuid,
  organizationId: uuid,
  establishmentId: uuid,
  establishmentName: z.string().min(1),
  userId: uuid,
  email: z.string().email(),
  role: workforceRoleSummarySchema.nullable(),
  joinedAt: instant,
});

export const workforceMemberListSchema = z.array(workforceMemberSchema);

export const acceptedWorkforceInvitationSchema = z.object({
  organizationId: uuid,
  establishmentId: uuid,
});

export const inviteWorkforceMemberSchema = z.object({
  email: z.string().trim().email("Ingresa un correo electrónico válido.").max(254),
  establishmentId: uuid,
  roleId: uuid,
});

export const workforcePermissionDefinitionSchema = z.object({
  key: z.string().min(1).max(96),
  group: z.string().min(1),
  label: z.string().min(1),
  description: z.string().min(1),
  allowedScopes: z.array(workforcePermissionScopeSchema).min(1),
  sensitive: z.boolean(),
  dependencies: z.array(z.string()),
});
export const workforcePermissionListSchema = z.array(workforcePermissionDefinitionSchema);

export const workforceRoleSchema = z.object({
  id: uuid,
  organizationId: uuid,
  name: z.string().min(2).max(50),
  description: z.string().max(160).nullable(),
  status: z.enum(["ACTIVE", "ARCHIVED"]),
  version: z.number().int().nonnegative(),
  selectedGrants: z.array(workforcePermissionGrantSchema),
  effectiveGrants: z.array(workforcePermissionGrantSchema),
  activeMemberCount: z.number().int().nonnegative(),
  pendingInvitationCount: z.number().int().nonnegative(),
  updatedAt: instant,
});
export const workforceRoleListSchema = z.array(workforceRoleSchema);

export const saveWorkforceRoleSchema = z.object({
  name: z.string().trim().min(2, "Escribe al menos 2 caracteres.").max(50),
  description: z.string().trim().max(160).optional(),
  selectedGrants: z.array(workforcePermissionGrantSchema),
  version: z.number().int().nonnegative().optional(),
});

export const invitationTokenSchema = z.string().trim().min(1).max(512);
