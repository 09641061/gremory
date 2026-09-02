import "server-only";

import type { WorkforcePermission } from "../../../domain/model/enums/workforce-permission";
import type { WorkforceRoleRepository } from "../../../domain/services/workforce-role.repository";
import { WorkforceRoleApiGateway } from "../../../infrastructure/gateways/workforce-role-api.gateway";
import type { WorkforceRoleQueryService } from "../../services/workforce-role.services";

export class WorkforceRoleQueryServiceImpl implements WorkforceRoleQueryService {
  constructor(private readonly roles: WorkforceRoleRepository) {}

  list(organizationId?: string) {
    return this.roles.list(organizationId);
  }

  permissions(): Promise<ReadonlyArray<WorkforcePermission | string>> {
    return this.roles.permissions();
  }
}

export function createWorkforceRoleQueryService(
  token?: string,
  organizationId?: string,
): WorkforceRoleQueryService {
  return new WorkforceRoleQueryServiceImpl(new WorkforceRoleApiGateway(token, organizationId));
}
