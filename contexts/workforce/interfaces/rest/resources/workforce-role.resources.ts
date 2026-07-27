import type { WorkforcePermission } from "../../../domain/model/enums/workforce-permission";

export interface WorkforceRoleResource {
  id: string;
  name: string;
  permissions: ReadonlyArray<WorkforcePermission>;
  systemRole: boolean;
}

export interface WorkforceRoleRequest {
  name: string;
  permissions: ReadonlyArray<WorkforcePermission>;
}

export interface AssignWorkforceRoleRequest {
  roleId: string;
}
