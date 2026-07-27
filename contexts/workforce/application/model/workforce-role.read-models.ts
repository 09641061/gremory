export interface WorkforceRoleSummary {
  id: string | null;
  name: string;
  permissions: ReadonlyArray<string>;
  systemRole: boolean;
}

export interface WorkforceRolePermissionsView {
  permissions: ReadonlyArray<string>;
}
