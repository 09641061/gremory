import { z } from "zod";

const uuidSchema = z.string().uuid();

export const businessWorkspaceResourceSchema = z.object({
  activeOrganizationId: uuidSchema.nullable(),
  activeEstablishmentId: uuidSchema.nullable(),
  organizations: z.array(z.object({
    id: uuidSchema,
    name: z.string().trim().min(1),
    imageUrl: z.string().nullable(),
    mode: z.enum(["OWNER", "MEMBER"]),
    establishments: z.array(z.object({
      id: uuidSchema,
      name: z.string().trim().min(1),
      photoUrl: z.string().nullable(),
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
