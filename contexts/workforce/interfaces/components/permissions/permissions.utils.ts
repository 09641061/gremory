export function groupPermissions(permissions: ReadonlyArray<string>) {
  const groups = new Map<string, string[]>();
  for (const permission of permissions) {
    const [context] = permission.split(":");
    const group = groups.get(context) ?? [];
    group.push(permission);
    groups.set(context, group);
  }
  return [...groups.entries()].map(([label, values]) => ({ label, permissions: values }));
}

export function permissionLabel(permission: string) {
  const action = permission.split(":").at(-1) ?? permission;
  return action.charAt(0).toUpperCase() + action.slice(1);
}
