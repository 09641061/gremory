export const workforcePermissionCodes = [
  "business:read",
  "business:manage",
  "catalog:read",
  "catalog:manage",
  "crm:read",
  "crm:manage",
  "workforce:read",
  "workforce:manage",
  "scheduling:read",
  "scheduling:manage",
] as const;

export type WorkforcePermission = (typeof workforcePermissionCodes)[number];

export function isWorkforcePermission(value: string): value is WorkforcePermission {
  return workforcePermissionCodes.includes(value as WorkforcePermission);
}
