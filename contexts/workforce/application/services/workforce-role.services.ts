import type {
  AssignWorkforceRoleCommand,
  RemoveWorkforceRoleAssignmentCommand,
  DeleteWorkforceRoleCommand,
  CreateWorkforceRoleCommand,
  PatchWorkforceRoleCommand,
} from "../../domain/model/commands/workforce-role.commands";
import type { WorkforceRole } from "../../domain/model/entities/workforce-role.entity";
import type { WorkforcePermission } from "../../domain/model/enums/workforce-permission";

export interface WorkforceRoleCommandService {
  create(command: CreateWorkforceRoleCommand): Promise<WorkforceRole>;
  patch(command: PatchWorkforceRoleCommand): Promise<WorkforceRole>;
  delete(command: DeleteWorkforceRoleCommand): Promise<void>;
  assign(command: AssignWorkforceRoleCommand): Promise<void>;
  removeAssignment?(command: RemoveWorkforceRoleAssignmentCommand): Promise<void>;
}

export interface WorkforceRoleQueryService {
  list(organizationId?: string): Promise<ReadonlyArray<WorkforceRole>>;
  permissions(): Promise<ReadonlyArray<WorkforcePermission>>;
}
