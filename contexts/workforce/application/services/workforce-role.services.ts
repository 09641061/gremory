import type {
  AssignWorkforceRoleCommand,
  DeleteWorkforceRoleCommand,
  CreateWorkforceRoleCommand,
  UpdateWorkforceRoleCommand,
} from "../../domain/model/commands/workforce-role.commands";
import type { WorkforceRole } from "../../domain/model/entities/workforce-role.entity";
import type { WorkforcePermission } from "../../domain/model/enums/workforce-permission";

export interface WorkforceRoleCommandService {
  create(command: CreateWorkforceRoleCommand): Promise<WorkforceRole>;
  update(command: UpdateWorkforceRoleCommand): Promise<WorkforceRole>;
  delete(command: DeleteWorkforceRoleCommand): Promise<void>;
  assign(command: AssignWorkforceRoleCommand): Promise<void>;
}

export interface WorkforceRoleQueryService {
  list(): Promise<ReadonlyArray<WorkforceRole>>;
  permissions(): Promise<ReadonlyArray<WorkforcePermission>>;
}
