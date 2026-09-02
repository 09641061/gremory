/**
 * Permissions the backend allows to be granted to a role. `GET
 * /api/workforce/roles/permissions` returns exactly this list and any other
 * code is rejected with 400. The editor must only offer these codes.
 */
export const workforceAssignablePermissions = [
  "scheduling:read",
  "scheduling:manage",
  "availability:manage_self",
  "availability:manage_all",
  "catalog:read",
  "catalog:manage",
  "crm:read",
  "crm:manage",
  "workforce:read",
  "workforce:manage",
  "analytics:read",
  "assistant:manage",
  "establishment:update",
] as const;

export type WorkforceAssignablePermission = (typeof workforceAssignablePermissions)[number];

export function isWorkforceAssignablePermission(
  value: string,
): value is WorkforceAssignablePermission {
  return workforceAssignablePermissions.includes(value as WorkforceAssignablePermission);
}

/**
 * Full legacy permission contract exposed by the Workforce bounded context.
 * Includes non-assignable codes that may still appear in seeded roles; they
 * are recognized for display but never sent back to the backend.
 */
export const workforcePermissions = {
  organization: {
    read: "organization:read",
    update: "organization:update",
    createEstablishment: "organization:create_establishment",
    manageBilling: "organization:manage_billing",
  },
  establishment: {
    read: "establishment:read",
    update: "establishment:update",
    delete: "establishment:delete",
  },
  catalog: {
    read: "catalog:read",
    manage: "catalog:manage",
  },
  crm: {
    read: "crm:read",
    manage: "crm:manage",
  },
  analytics: {
    read: "analytics:read",
  },
  workforce: {
    read: "workforce:read",
    invite: "workforce:invite",
    manageMembers: "workforce:manage_members",
    manageRoles: "workforce:manage_roles",
    manage: "workforce:manage",
  },
  scheduling: {
    read: "scheduling:read",
    manage: "scheduling:manage",
  },
  assistant: {
    manage: "assistant:manage",
  },
} as const;

type DeepValue<T> = T extends string
  ? T
  : T extends Readonly<Record<string, unknown>>
    ? DeepValue<T[keyof T]>
    : never;

export type WorkforcePermission = DeepValue<typeof workforcePermissions>;

function collectPermissionCodes(value: unknown): WorkforcePermission[] {
  if (typeof value === "string") return [value as WorkforcePermission];
  if (!value || typeof value !== "object") return [];
  return Object.values(value).flatMap(collectPermissionCodes);
}

export const workforcePermissionCodes = Object.freeze(
  [...new Set(collectPermissionCodes(workforcePermissions))],
) as readonly [WorkforcePermission, ...WorkforcePermission[]];

export function isWorkforcePermission(value: string): value is WorkforcePermission {
  return workforcePermissionCodes.includes(value as WorkforcePermission);
}
