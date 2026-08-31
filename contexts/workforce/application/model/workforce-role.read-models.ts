export interface WorkforceRoleSummary {
  id: string | null;
  name: string;
  permissions: ReadonlyArray<string>;
  systemRole: boolean;
  position: number;
}

export interface WorkforceRolePermissionsView {
  permissions: ReadonlyArray<string>;
}
