import type { WorkforceRole } from "../model/entities/workforce-role.entity";
import type { WorkforcePermission } from "../model/enums/workforce-permission";
import type {
  AssignWorkforceRoleCommand,
  DeleteWorkforceRoleCommand,
} from "../model/commands/workforce-role.commands";

export interface WorkforceRoleRepository {
  list(): Promise<WorkforceRole[]>;
  permissions(): Promise<readonly WorkforcePermission[]>;
  save(role: WorkforceRole): Promise<WorkforceRole>;
  delete(command: DeleteWorkforceRoleCommand): Promise<void>;
  assign(command: AssignWorkforceRoleCommand): Promise<void>;
}
