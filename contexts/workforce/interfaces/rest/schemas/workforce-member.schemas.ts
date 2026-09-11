import { z } from "zod";

import { pageResponseSchema } from "@/contexts/shared/interfaces/rest/schemas/page-response.schema";

export const workforceRoleSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  position: z.number().int(),
  systemRole: z.boolean(),
  permissions: z.array(z.string()),
});

export const workforceMemberSchema = z.object({
  invitationId: z.string().uuid(),
  memberId: z.string().uuid().nullable(),
  userId: z.string().uuid().nullable(),
  email: z.string().email(),
  username: z.string().nullable(),
  imageUrl: z.string().nullable(),
  organizationId: z.string().uuid(),
  organizationName: z.string().nullable(),
  establishmentId: z.string().uuid(),
  establishmentName: z.string().nullable(),
  status: z.enum(["PENDING", "ACTIVE", "REMOVED", "EXPIRED"]),
  roles: z.array(workforceRoleSchema),
  invitedAt: z.string(),
  invitationExpiresAt: z.string(),
  acceptedAt: z.string().nullable(),
  joinedAt: z.string().nullable(),
  removedAt: z.string().nullable(),
  isOwner: z.boolean(),
});

export const workforceMemberPageSchema = pageResponseSchema(workforceMemberSchema);
export const workforceRolePageSchema = pageResponseSchema(workforceRoleSchema);

export const createWorkforceInvitationSchema = z
  .object({
    establishmentId: z.string().uuid("A valid establishment is required"),
    email: z
      .string()
      .trim()
      .min(1, "Email is required")
      .email("Enter a valid email address"),
  })
  .strict();

export const workforceInvitationSchema = z.object({
  id: z.string().uuid(),
  organizationId: z.string().uuid(),
  establishmentId: z.string().uuid(),
  establishmentName: z.string().nullable(),
  invitedEmail: z.string(),
  invitedByUserId: z.string().uuid(),
  status: z.enum(["PENDING", "ACCEPTED", "REVOKED", "EXPIRED"]),
  expiresAt: z.string(),
  acceptedByUserId: z.string().uuid().nullable(),
  acceptedAt: z.string().nullable(),
  revokedAt: z.string().nullable(),
  createdAt: z.string(),
});

export const workforceMembershipSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  email: z.string().nullable(),
  organizationId: z.string().uuid(),
  establishmentId: z.string().uuid(),
  establishmentName: z.string().nullable(),
  invitationId: z.string().uuid(),
  status: z.enum(["ACTIVE", "REMOVED"]),
  joinedAt: z.string(),
  removedAt: z.string().nullable(),
});

export const workforceInvitationAcceptanceSchema = z.object({
  invitation: workforceInvitationSchema,
  membership: workforceMembershipSchema,
  alreadyMember: z.boolean(),
});

export const workforceInvitationPreviewSchema = z.object({
  organizationId: z.string().uuid(),
  organizationName: z.string(),
  establishmentId: z.string().uuid(),
  establishmentName: z.string(),
  invitedEmail: z.string(),
  maskedEmail: z.string(),
  status: z.enum(["PENDING", "ACCEPTED", "REMOVED"]),
  expiresAt: z.string(),
});

export const workforceRolePermissionCatalog = [
  "workforce:read_members",
  "workforce:invite",
  "workforce:revoke_invitation",
  "workforce:assign_roles",
  "workforce:manage_members",
] as const;

const rolePermissionSchema = z.enum(workforceRolePermissionCatalog);

export const createWorkforceRoleSchema = z.object({
  name: z.string().trim().min(1, "Role name is required").max(100, "Role name cannot exceed 100 characters"),
  permissions: z.array(rolePermissionSchema).max(workforceRolePermissionCatalog.length).refine(
    (permissions) => new Set(permissions).size === permissions.length,
    "Role permissions cannot contain duplicates",
  ),
}).strict();

export const updateWorkforceRoleSchema = createWorkforceRoleSchema;

export type WorkforceMemberResource = z.infer<typeof workforceMemberSchema>;
export type WorkforceRoleResource = z.infer<typeof workforceRoleSchema>;
export type WorkforceInvitationResource = z.infer<typeof workforceInvitationSchema>;
export type WorkforceMembershipResource = z.infer<typeof workforceMembershipSchema>;
export type WorkforceInvitationAcceptanceResource = z.infer<typeof workforceInvitationAcceptanceSchema>;
export type WorkforceInvitationPreviewResource = z.infer<typeof workforceInvitationPreviewSchema>;
export type CreateWorkforceInvitationInput = z.infer<typeof createWorkforceInvitationSchema>;
