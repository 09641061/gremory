import { z } from "zod";
import {
  workforceAssignablePermissions,
  workforcePermissionCodes,
  isWorkforceAssignablePermission,
} from "../../../domain/model/enums/workforce-permission";

const uuidSchema = z.string().uuid();
const workforcePermissionSchema = z.string().refine(isWorkforceAssignablePermission, {
  message: "Unsupported workforce permission",
});

export const workforceRoleCreateRequestSchema = z.object({
  name: z.string().trim().min(1).max(100),
  position: z.number().int().min(1).optional(),
});

export const workforceRolePatchRequestSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  permissions: z.array(workforcePermissionSchema).optional(),
  position: z.number().int().min(1).optional(),
}).refine((value) => value.name !== undefined || value.permissions !== undefined || value.position !== undefined, {
  message: "At least one field must be provided",
});

export const assignWorkforceRoleRequestSchema = z.object({
  roleId: uuidSchema,
});

export const workforceRoleResourceSchema = z.object({
  id: uuidSchema,
  name: z.string().trim().min(1),
  permissions: z.array(z.enum(workforcePermissionCodes)),
  systemRole: z.boolean(),
  position: z.number().int().min(1).optional(),
});

export const workforceRoleResourcesSchema = z.array(workforceRoleResourceSchema);

export const workforceRolePageResourceSchema = z.object({
  content: z.array(workforceRoleResourceSchema),
  page: z.number().int().nonnegative(),
  size: z.number().int().nonnegative(),
  totalElements: z.number().int().nonnegative(),
  totalPages: z.number().int().nonnegative(),
});

export const workforceRolePermissionsSchema = z.array(
  z.enum(workforceAssignablePermissions),
);
