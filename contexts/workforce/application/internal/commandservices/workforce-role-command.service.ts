import "server-only";

import type {
  AssignWorkforceRoleCommand,
  DeleteWorkforceRoleCommand,
  CreateWorkforceRoleCommand,
  PatchWorkforceRoleCommand,
  RemoveWorkforceRoleAssignmentCommand,
} from "../../../domain/model/commands/workforce-role.commands";
import { WorkforceRole } from "../../../domain/model/entities/workforce-role.entity";
import type { WorkforceRoleRepository } from "../../../domain/services/workforce-role.repository";
import { WorkforceRoleApiGateway } from "../../../infrastructure/gateways/workforce-role-api.gateway";
import type { WorkforceRoleCommandService } from "../../services/workforce-role.services";

export class WorkforceRoleCommandServiceImpl implements WorkforceRoleCommandService {
  constructor(private readonly roles: WorkforceRoleRepository) {}

  async create(command: CreateWorkforceRoleCommand): Promise<WorkforceRole> {
    return this.roles.save(
      WorkforceRole.create({
        name: command.name,
        permissions: [],
        systemRole: false,
        position: command.position ?? 1,
      }),
    );
  }

  async patch(command: PatchWorkforceRoleCommand): Promise<WorkforceRole> {
    return this.roles.patch(command);
  }

  delete(command: DeleteWorkforceRoleCommand): Promise<void> {
    return this.roles.delete(command);
  }

  assign(command: AssignWorkforceRoleCommand): Promise<void> {
    return this.roles.assign(command);
  }

  removeAssignment(command: RemoveWorkforceRoleAssignmentCommand): Promise<void> {
    if (!this.roles.removeAssignment) return Promise.reject(new Error("Role assignment removal is unavailable"));
    return this.roles.removeAssignment(command);
  }
}

export function createWorkforceRoleCommandService(
  token?: string,
): WorkforceRoleCommandService {
  return new WorkforceRoleCommandServiceImpl(new WorkforceRoleApiGateway(token));
}
