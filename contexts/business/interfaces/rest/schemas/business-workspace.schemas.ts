import { z } from "zod";

const uuidSchema = z.string().uuid();

const workspaceCapabilitiesSchema = z
  .object({
    canReadAppointments: z.boolean().optional(),
    canReadCatalog: z.boolean().optional(),
    canReadCustomers: z.boolean().optional(),
    canReadTeam: z.boolean().optional(),
    canReadAnalytics: z.boolean().optional(),
  })
  .optional();

const workspaceAccessPolicySchema = z
  .object({
    canOpenAnalytics: z.boolean().optional(),
    canOpenScheduling: z.boolean().optional(),
    canOpenCrm: z.boolean().optional(),
    canOpenCatalog: z.boolean().optional(),
    canOpenTeam: z.boolean().optional(),
    canCreateEstablishment: z.boolean().optional(),
    canManageBilling: z.boolean().optional(),
  })
  .optional();

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
  organizationId: uuidSchema.optional(),
  organizationName: z.string().trim().min(1).optional(),
  // Known even for a foreign organization the account only belongs to as a
  // member - unlike `organization.imageUrl` below, which only ever describes
  // whichever organization is currently active.
  organizationImageUrl: z.string().nullable().optional(),
});

// An account owns one organization or belongs to one; it is never a list.
export const businessWorkspaceResourceSchema = z.object({
  accountType: z.enum(["OWNER", "MEMBER", "PENDING_INVITATION"]),
  // Drives the mandatory setup steps for a freshly registered owner. A member
  // who joined by invitation always reads COMPLETED, immediately.
  onboardingStatus: z
    .enum(["ORGANIZATION_PENDING", "ESTABLISHMENT_PENDING", "COMPLETED"])
    .nullable(),
  onboardingCompleted: z.boolean(),
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
  capabilities: workspaceCapabilitiesSchema,
  accessPolicy: workspaceAccessPolicySchema,
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
  // The organization this account owns, independent of which one is active.
  // Null while browsing a foreign organization as a member that owns none.
  ownedOrganizationId: uuidSchema.nullable().optional(),
});

export type BusinessWorkspaceResource = z.infer<typeof businessWorkspaceResourceSchema>;
