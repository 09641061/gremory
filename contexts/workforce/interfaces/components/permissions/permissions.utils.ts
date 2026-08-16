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
