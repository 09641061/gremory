import { z } from "zod";

const uuidSchema = z.string().uuid();

const establishmentResourceSchema = z.object({
  id: uuidSchema,
  name: z.string().trim().min(1),
  photoUrl: z.string().nullable(),
  timeZone: z.string().nullable().optional(),
  effectivePermissions: z.array(z.string()).default([]),
  permissions: z.object({
    canRead: z.boolean(),
    canUpdate: z.boolean(),
    canDelete: z.boolean(),
  }),
});

// An account owns one organization or belongs to one; it is never a list.
export const businessWorkspaceResourceSchema = z.object({
  accountType: z.enum(["OWNER", "MEMBER", "PENDING_INVITATION"]),
  organization: z
    .object({
      id: uuidSchema,
      name: z.string().trim().min(1),
      imageUrl: z.string().nullable(),
      permissions: z.object({
        canRead: z.boolean(),
        canUpdate: z.boolean(),
        canCreateEstablishment: z.boolean(),
      }),
    })
    .nullable(),
  establishments: z.array(establishmentResourceSchema).default([]),
  activeEstablishmentId: uuidSchema.nullable(),
  // Always the owner's subscription, even when the caller is a member.
  subscription: z
    .object({
      active: z.boolean(),
      planName: z.string().nullable(),
      status: z.string().nullable(),
      canManageBilling: z.boolean(),
    })
    .nullable(),
  // Present only for PENDING_INVITATION. Never carries the invitation token.
  pendingInvitation: z
    .object({
      organizationName: z.string().trim().min(1),
      establishmentName: z.string().trim().min(1),
      expiresAt: z.string(),
    })
    .nullable()
    .optional(),
});

export type BusinessWorkspaceResource = z.infer<typeof businessWorkspaceResourceSchema>;
