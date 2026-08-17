import { z } from "zod";

const uuidSchema = z.string().uuid();

const organizationPermissionsSchema = z.object({
  canRead: z.boolean(),
  canUpdate: z.boolean(),
  canCreateEstablishment: z.boolean(),
});

const establishmentSchema = z.object({
  id: uuidSchema,
  name: z.string().trim().min(1),
  photoUrl: z.string().nullable().optional(),
  timeZone: z.string().nullable().optional(),
  // The accessible-organizations endpoint scopes establishments already. It
  // may omit per-establishment permissions because organization permissions
  // are returned separately and this response powers the organization index.
  permissions: z.object({
    canRead: z.boolean(),
    canUpdate: z.boolean(),
    canDelete: z.boolean(),
  }).optional(),
  effectivePermissions: z.array(z.string()).default([]),
});

export const accessibleOrganizationSchema = z.object({
  id: uuidSchema,
  name: z.string().trim().min(1),
  imageUrl: z.string().nullable(),
  isOwned: z.boolean(),
  permissions: organizationPermissionsSchema,
  establishments: z.array(establishmentSchema).default([]),
});

export const accessibleOrganizationsSchema = z.array(accessibleOrganizationSchema);

export type AccessibleOrganizationResource = z.infer<typeof accessibleOrganizationSchema>;
