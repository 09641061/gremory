export interface WorkforceRoleSummary {
  id: string | null;
  name: string;
  permissions: ReadonlyArray<string>;
}

export interface WorkforceRolePermissionsView {
  permissions: ReadonlyArray<string>;
}
