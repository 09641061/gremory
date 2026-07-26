import "server-only";

import { apiConfig } from "@/api.config";
import { WorkforceRole } from "../../domain/model/entities/workforce-role.entity";
import type {
  AssignWorkforceRoleCommand,
  DeleteWorkforceRoleCommand,
} from "../../domain/model/commands/workforce-role.commands";
import type { WorkforceRoleRepository } from "../../domain/services/workforce-role.repository";
import type { WorkforceRoleResource } from "../../interfaces/rest/resources/workforce-role.resources";
import { requireTeamAccessToken } from "../session/team-session";
import { teamDelete, teamGet, teamPost, teamPut } from "../http/team-api.client";
import {
  workforceRolePermissionsSchema,
  workforceRoleResourcesSchema,
  workforceRoleResourceSchema,
} from "../../interfaces/rest/schemas/workforce-role.schemas";

export class WorkforceRoleApiGateway implements WorkforceRoleRepository {
  constructor(private readonly providedToken?: string) {}

  async list() {
    const token = await requireTeamAccessToken(this.providedToken);
    const response = await teamGet<unknown>(apiConfig.routes.workforce.roles, token);
    return workforceRoleResourcesSchema.parse(response).map(toRole);
  }

  async permissions() {
    const response = await teamGet<unknown>(apiConfig.routes.workforce.rolePermissions);
    return workforceRolePermissionsSchema.parse(response);
  }

  async save(role: WorkforceRole) {
    const token = await requireTeamAccessToken(this.providedToken);
    const body = {
      name: role.getName(),
      permissions: [...role.getPermissions()],
    };
    const response = role.id
      ? await teamPut<unknown>(
          `${apiConfig.routes.workforce.roles}/${encodeURIComponent(role.id)}`,
          body,
          token,
        )
      : await teamPost<unknown>(apiConfig.routes.workforce.roles, body, token);
    return toRole(workforceRoleResourceSchema.parse(response));
  }

  async delete(command: DeleteWorkforceRoleCommand): Promise<void> {
    const token = await requireTeamAccessToken(this.providedToken);
    await teamDelete(
      `${apiConfig.routes.workforce.roles}/${encodeURIComponent(command.roleId)}`,
      token,
    );
  }

  async assign(command: AssignWorkforceRoleCommand): Promise<void> {
    const token = await requireTeamAccessToken(this.providedToken);
    await teamPut(
      `${apiConfig.routes.workforce.roles}/members/${encodeURIComponent(command.memberId)}`,
      { roleId: command.roleId },
      token,
    );
  }
}

function toRole(resource: WorkforceRoleResource) {
  return WorkforceRole.rehydrate({
    id: resource.id,
    name: resource.name,
    permissions: resource.permissions,
  });
}
