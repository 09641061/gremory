export type PermissionGroup = Readonly<{
  context: string;
  label: string;
  permissions: ReadonlyArray<string>;
}>;

export function groupPermissions(permissions: ReadonlyArray<string>) {
  const groups = new Map<string, string[]>();
  for (const permission of permissions) {
    const [context] = permission.split(":");
    const group = groups.get(context) ?? [];
    group.push(permission);
    groups.set(context, group);
  }
  return [...groups.entries()].map(([context, values]) => ({
    context,
    label: formatPermissionGroupLabel(context),
    permissions: values,
  }));
}

export function permissionLabel(permission: string) {
  const action = permission.split(":").at(-1) ?? permission;
  return action
    .replaceAll("_", " ")
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function permissionDescription(permission: string) {
  const descriptions: Record<string, string> = {
    "business:read": "Can view the organization and its establishments.",
    "business:manage": "Can edit organization and establishment settings.",
    "workforce:read": "Can view team members.",
    "workforce:invite": "Can invite users to the team.",
    "workforce:manage_members": "Can manage team memberships.",
    "workforce:manage_roles": "Can create, edit, and assign roles.",
    "workforce:manage": "Can manage team members and roles.",
    "scheduling:read": "Can open the scheduling page and view appointments.",
    "scheduling:manage": "Can create and manage appointments.",
    "catalog:read": "Can open and view the catalog.",
    "catalog:manage": "Can create and manage catalog items.",
    "crm:read": "Can open and view customers.",
    "crm:manage": "Can create and manage customers.",
    "analytics:read": "Can open and view analytics.",
  };

  return descriptions[permission] ?? "Allows this capability in the workspace.";
}

function formatPermissionGroupLabel(context: string) {
  if (context === "business") return "Organization";
  if (context === "workforce") return "Team";
  return context.charAt(0).toUpperCase() + context.slice(1);
}

export function permissionGroupPriority(context: string) {
  const order: Record<string, number> = {
    business: 0,
    workforce: 1,
    scheduling: 2,
    crm: 3,
    catalog: 4,
    analytics: 5,
  };

  return order[context] ?? 100;
}
