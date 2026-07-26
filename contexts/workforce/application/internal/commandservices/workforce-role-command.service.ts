import "server-only";

import type {
  AssignWorkforceRoleCommand,
  DeleteWorkforceRoleCommand,
  CreateWorkforceRoleCommand,
  UpdateWorkforceRoleCommand,
} from "../../../domain/model/commands/workforce-role.commands";
import { WorkforceRole } from "../../../domain/model/entities/workforce-role.entity";
import type { WorkforcePermission } from "../../../domain/model/enums/workforce-permission";
import type { WorkforceRoleRepository } from "../../../domain/services/workforce-role.repository";
import { WorkforceRoleApiGateway } from "../../../infrastructure/gateways/workforce-role-api.gateway";
import type { WorkforceRoleCommandService } from "../../services/workforce-role.services";

export class WorkforceRoleCommandServiceImpl implements WorkforceRoleCommandService {
  constructor(private readonly roles: WorkforceRoleRepository) {}

  async create(command: CreateWorkforceRoleCommand): Promise<WorkforceRole> {
    return this.roles.save(
      WorkforceRole.create({
        name: command.name,
        permissions: [...command.permissions] as WorkforcePermission[],
      }),
    );
  }

  async update(command: UpdateWorkforceRoleCommand): Promise<WorkforceRole> {
    return this.roles.save(
      WorkforceRole.rehydrate({
        id: command.roleId,
        name: command.name,
        permissions: [...command.permissions] as WorkforcePermission[],
      }),
    );
  }

  delete(command: DeleteWorkforceRoleCommand): Promise<void> {
    return this.roles.delete(command);
  }

  assign(command: AssignWorkforceRoleCommand): Promise<void> {
    return this.roles.assign(command);
  }
}

export function createWorkforceRoleCommandService(
  token?: string,
): WorkforceRoleCommandService {
  return new WorkforceRoleCommandServiceImpl(new WorkforceRoleApiGateway(token));
}
