import type { WorkforcePermission } from "../../domain/model/enums/workforce-permission";

export interface WorkforceRoleSummary {
  id: string | null;
  name: string;
  permissions: ReadonlyArray<WorkforcePermission>;
}

export interface WorkforceRolePermissionsView {
  permissions: ReadonlyArray<WorkforcePermission>;
}
