import { z } from "zod";
import {
  workforcePermissionCodes,
  isWorkforcePermission,
} from "../../../domain/model/enums/workforce-permission";

const uuidSchema = z.string().uuid();
const workforcePermissionSchema = z.string().refine(isWorkforcePermission, {
  message: "Unsupported workforce permission",
});

export const workforceRoleCreateRequestSchema = z.object({
  name: z.string().trim().min(1).max(100),
  permissions: z.array(workforcePermissionSchema).min(1),
});

export const workforceRolePatchRequestSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  permissions: z.array(workforcePermissionSchema).optional(),
}).refine((value) => value.name !== undefined || value.permissions !== undefined, {
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
});

export const workforceRoleResourcesSchema = z.array(workforceRoleResourceSchema);

export const workforceRolePageResourceSchema = z.object({
  content: z.array(workforceRoleResourceSchema),
});

export const workforceRolePermissionsSchema = z.array(
  z.enum(workforcePermissionCodes),
);
