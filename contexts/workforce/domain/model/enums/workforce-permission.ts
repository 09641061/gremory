/**
 * Stable permission contract exposed by the Workforce bounded context.
 * UI components consume capabilities and never compare these codes directly.
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
