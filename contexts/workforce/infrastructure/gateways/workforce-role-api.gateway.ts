import "server-only";

import { apiConfig } from "@/api.config";
import {
  EVERYONE_POSITION,
  WorkforceRole,
} from "../../domain/model/entities/workforce-role.entity";
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
  constructor(
    private readonly providedToken?: string,
    private readonly organizationId?: string,
  ) {}

  private tenantHeaders() {
    return this.organizationId ? { "X-Organization-Id": this.organizationId } : undefined;
  }

  async list(organizationId?: string) {
    const token = await requireTeamAccessToken(this.providedToken);
    const resolvedOrgId = organizationId ?? this.organizationId;
    const params = new URLSearchParams({ page: "0", size: "20" });
    const headers = resolvedOrgId ? { "X-Organization-Id": resolvedOrgId } : undefined;
    const response = await teamGet<unknown>(
      `${apiConfig.routes.workforce.roles}?${params}`,
      token,
      headers,
    );
    const page = workforceRolePageResourceSchema.parse(response);
    return workforceRoleResourcesSchema.parse(page.content).map(toRole);
  }

  async permissions() {
    const token = await requireTeamAccessToken(this.providedToken);
    const response = await teamGet<unknown>(apiConfig.routes.workforce.rolePermissions, token, this.tenantHeaders());
    return workforceRolePermissionsSchema.parse(response);
  }

  async save(role: WorkforceRole) {
    const token = await requireTeamAccessToken(this.providedToken);
    const body = workforceRoleCreateRequestSchema.parse({
      name: role.getName(),
      position: role.id === null || role.position === 2_147_483_647 ? undefined : role.position,
    });
    const response = await teamPost<unknown>(
      apiConfig.routes.workforce.roles,
      body,
      token,
      this.tenantHeaders(),
    );
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
      this.tenantHeaders(),
    );
    return toRole(workforceRoleResourceSchema.parse(response));
  }

  async delete(command: DeleteWorkforceRoleCommand): Promise<void> {
    const token = await requireTeamAccessToken(this.providedToken);
    await teamDelete(
      `${apiConfig.routes.workforce.roles}/${encodeURIComponent(command.roleId)}`,
      token,
      this.tenantHeaders(),
    );
  }

  async assign(command: AssignWorkforceRoleCommand): Promise<void> {
    const token = await requireTeamAccessToken(this.providedToken);
    await teamPut(
      `${apiConfig.routes.workforce.roles}/members/${encodeURIComponent(command.memberId)}`,
      { roleId: command.roleId },
      token,
      this.tenantHeaders(),
    );
  }

  async removeAssignment(command: RemoveWorkforceRoleAssignmentCommand): Promise<void> {
    const token = await requireTeamAccessToken(this.providedToken);
    await teamDelete(
      `${apiConfig.routes.workforce.roles}/members/${encodeURIComponent(command.memberId)}/${encodeURIComponent(command.roleId)}`,
      token,
      this.tenantHeaders(),
    );
  }
}

function toRole(resource: WorkforceRoleResource) {
  return WorkforceRole.rehydrate({
    id: resource.id,
    name: resource.name,
    permissions: resource.permissions,
    systemRole: resource.systemRole,
    position: resource.systemRole ? EVERYONE_POSITION : (resource.position ?? 1),
  });
}
