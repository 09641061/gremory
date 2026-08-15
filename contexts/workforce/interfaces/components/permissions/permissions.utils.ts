export function groupPermissions(permissions: ReadonlyArray<string>) {
  const groups = new Map<string, string[]>();
  for (const permission of permissions) {
    const [context] = permission.split(":");
    const group = groups.get(context) ?? [];
    group.push(permission);
    groups.set(context, group);
  }
  return [...groups.entries()].map(([context, values]) => ({ label: formatPermissionGroupLabel(context), permissions: values }));
}

export function permissionLabel(permission: string) {
  const action = permission.split(":").at(-1) ?? permission;
  return action.charAt(0).toUpperCase() + action.slice(1);
}

function formatPermissionGroupLabel(context: string) {
  if (context === "business") return "Organization";
  if (context === "workforce") return "Team";
  return context.charAt(0).toUpperCase() + context.slice(1);
}
