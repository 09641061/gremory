import "server-only";

import { apiConfig } from "@/api.config";
import { WorkforceRole } from "../../domain/model/entities/workforce-role.entity";
import type {
  AssignWorkforceRoleCommand,
  DeleteWorkforceRoleCommand,
  PatchWorkforceRoleCommand,
  RemoveWorkforceRoleAssignmentCommand,
} from "../../domain/model/commands/workforce-role.commands";
import type { WorkforceRoleRepository } from "../../domain/services/workforce-role.repository";
import type { WorkforceRoleResource } from "../../interfaces/rest/resources/workforce-role.resources";
import { requireTeamAccessToken } from "../session/team-session";
import { teamDelete, teamGet, teamPatch, teamPost, teamPut } from "../http/team-api.client";
import {
  workforceRoleCreateRequestSchema,
  workforceRolePatchRequestSchema,
  workforceRolePageResourceSchema,
  workforceRolePermissionsSchema,
  workforceRoleResourcesSchema,
  workforceRoleResourceSchema,
} from "../../interfaces/rest/schemas/workforce-role.schemas";

export class WorkforceRoleApiGateway implements WorkforceRoleRepository {
  constructor(private readonly providedToken?: string) {}

  async list(organizationId?: string) {
    const token = await requireTeamAccessToken(this.providedToken);
    const query = organizationId ? `?organizationId=${encodeURIComponent(organizationId)}` : "";
    const response = await teamGet<unknown>(`${apiConfig.routes.workforce.roles}${query}`, token);
    const page = workforceRolePageResourceSchema.parse(response);
    return workforceRoleResourcesSchema.parse(page.content).map(toRole);
  }

  async permissions() {
    const token = await requireTeamAccessToken(this.providedToken);
    const response = await teamGet<unknown>(apiConfig.routes.workforce.rolePermissions, token);
    return workforceRolePermissionsSchema.parse(response);
  }

  async save(role: WorkforceRole) {
    const token = await requireTeamAccessToken(this.providedToken);
    const body = workforceRoleCreateRequestSchema.parse({
      name: role.getName(),
      position: role.id === null || role.position === 2_147_483_647 ? undefined : role.position,
    });
    const response = await teamPost<unknown>(apiConfig.routes.workforce.roles, body, token);
    return toRole(workforceRoleResourceSchema.parse(response));
  }

  async patch(command: PatchWorkforceRoleCommand) {
    const token = await requireTeamAccessToken(this.providedToken);
    const body = workforceRolePatchRequestSchema.parse({
      name: command.name,
      permissions: command.permissions,
      position: command.position,
    });
    const response = await teamPatch<unknown>(
      `${apiConfig.routes.workforce.roles}/${encodeURIComponent(command.roleId)}`,
      body,
      token,
    );
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

  async removeAssignment(command: RemoveWorkforceRoleAssignmentCommand): Promise<void> {
    const token = await requireTeamAccessToken(this.providedToken);
    await teamDelete(
      `${apiConfig.routes.workforce.roles}/members/${encodeURIComponent(command.memberId)}/${encodeURIComponent(command.roleId)}`,
      token,
    );
  }
}

function toRole(resource: WorkforceRoleResource) {
  return WorkforceRole.rehydrate({
    id: resource.id,
    name: resource.name,
    permissions: resource.permissions,
    systemRole: resource.systemRole,
    position: resource.position ?? (resource.systemRole ? 2_147_483_647 : 1),
  });
}
