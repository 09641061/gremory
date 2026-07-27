import type { WorkforcePermission } from "../../../domain/model/enums/workforce-permission";

export interface WorkforceRoleResource {
  id: string;
  name: string;
  permissions: ReadonlyArray<WorkforcePermission>;
  systemRole: boolean;
  position?: number;
}

export interface WorkforceRoleRequest {
  name: string;
  permissions: ReadonlyArray<WorkforcePermission>;
  position?: number;
}

export interface AssignWorkforceRoleRequest {
  roleId: string;
}
