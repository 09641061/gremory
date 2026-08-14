import { z } from "zod";

const uuidSchema = z.string().uuid();
const workspaceCapabilitiesSchema = z.object({
  canReadAppointments: z.boolean().optional(),
  canReadCatalog: z.boolean().optional(),
  canReadCustomers: z.boolean().optional(),
  canReadTeam: z.boolean().optional(),
  canReadAnalytics: z.boolean().optional(),
}).optional();

export const businessWorkspaceResourceSchema = z.object({
  activeOrganizationId: uuidSchema.nullable(),
  activeEstablishmentId: uuidSchema.nullable(),
  capabilities: workspaceCapabilitiesSchema,
  organizations: z.array(z.object({
    id: uuidSchema,
    name: z.string().trim().min(1),
    imageUrl: z.string().nullable(),
    mode: z.enum(["OWNER", "MEMBER"]),
    establishments: z.array(z.object({
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
    })),
    permissions: z.object({
      canRead: z.boolean(),
      canUpdate: z.boolean(),
      canCreateEstablishment: z.boolean(),
    }),
  })),
});

export type BusinessWorkspaceResource = z.infer<typeof businessWorkspaceResourceSchema>;
