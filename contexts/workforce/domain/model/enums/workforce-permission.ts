export const workforcePermissionCodes = [
  "business:organizations:read",
  "business:organizations:update",
  "business:organizations:manage",
  "business:establishments:read",
  "business:establishments:update",
  "business:establishments:manage",
  "catalog:manage",
  "catalog:categories:create",
  "catalog:categories:read",
  "catalog:categories:update",
  "catalog:categories:delete",
  "catalog:categories:manage",
  "catalog:services:create",
  "catalog:services:read",
  "catalog:services:update",
  "catalog:services:delete",
  "catalog:services:manage",
  "crm:customers:create",
  "crm:customers:read",
  "crm:customers:update",
  "crm:customers:delete",
  "crm:customers:manage",
] as const;

export type WorkforcePermission = (typeof workforcePermissionCodes)[number];

export function isWorkforcePermission(value: string): value is WorkforcePermission {
  return workforcePermissionCodes.includes(value as WorkforcePermission);
}
