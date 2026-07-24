import "server-only";

import type {
  OrganizationCommandService,
  OrganizationQueryService,
} from "../../../domain/services/business.services";
import type { Organization } from "../../../domain/model/entities/organization.entity";
import type {
  CreateOrganizationCommand,
  UpdateOrganizationCommand,
  DeleteOrganizationCommand,
} from "../../../domain/model/commands/business.commands";
import { OrganizationApiGateway } from "../../../infrastructure/gateways/organization-api.gateway";

export class OrganizationCommandServiceImpl implements OrganizationCommandService {
  constructor(private readonly gateway: OrganizationApiGateway) {}

  create(command: CreateOrganizationCommand, token?: string): Promise<Organization> {
    return this.gateway.create(command, token);
  }

  update(command: UpdateOrganizationCommand, token?: string): Promise<Organization> {
    return this.gateway.update(command, token);
  }

  delete(command: DeleteOrganizationCommand, token?: string): Promise<void> {
    return this.gateway.delete(command, token);
  }
}

export class OrganizationQueryServiceImpl implements OrganizationQueryService {
  constructor(private readonly gateway: OrganizationApiGateway) {}

  getMyOrganization(token?: string): Promise<Organization> {
    return this.gateway.getMyOrganization(token);
  }

  getById(id: string, token?: string): Promise<Organization> {
    return this.gateway.getById(id, token);
  }
}

export function createOrganizationCommandService() {
  return new OrganizationCommandServiceImpl(new OrganizationApiGateway());
}

export function createOrganizationQueryService() {
  return new OrganizationQueryServiceImpl(new OrganizationApiGateway());
}
