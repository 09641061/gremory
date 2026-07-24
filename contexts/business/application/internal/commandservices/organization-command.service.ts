import "server-only";

import type {
  CreateOrganizationCommand,
  DeleteOrganizationCommand,
  UpdateOrganizationCommand,
} from "../../../domain/model/commands/business.commands";
import type { OrganizationCommandService } from "../../../domain/services/business.services";
import { OrganizationApiGateway } from "../../../infrastructure/gateways/organization-api.gateway";
export { createOrganizationQueryService } from "../queryservices/organization-query.service";

export class OrganizationCommandServiceImpl implements OrganizationCommandService {
  constructor(private readonly gateway: OrganizationCommandService = new OrganizationApiGateway()) {}

  create(command: CreateOrganizationCommand, token?: string) {
    return this.gateway.create(command, token);
  }

  update(command: UpdateOrganizationCommand, token?: string) {
    return this.gateway.update(command, token);
  }

  delete(command: DeleteOrganizationCommand, token?: string) {
    return this.gateway.delete(command, token);
  }
}

export function createOrganizationCommandService(): OrganizationCommandService {
  return new OrganizationCommandServiceImpl();
}
