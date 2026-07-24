import "server-only";

import { Organization } from "../../domain/model/entities/organization.entity";
import { createOrganizationId } from "../../domain/model/valueobjects/organization-id.vo";
import { createOrganizationName } from "../../domain/model/valueobjects/organization-name.vo";
import type {
  OrganizationCommandService,
  OrganizationQueryService,
} from "../../domain/services/business.services";
import type {
  CreateOrganizationCommand,
  UpdateOrganizationCommand,
  DeleteOrganizationCommand,
} from "../../domain/model/commands/business.commands";
import type {
  GetMyOrganizationQuery,
  GetOrganizationByIdQuery,
} from "../../domain/model/queries/business.queries";
import type { OrganizationResource } from "../../interfaces/rest/resources/business.resources";
import { businessDelete, businessGet, businessPost, businessPut } from "../http/business-api.client";
import { getBusinessAccessToken } from "../session/business-session";
import { businessApiConfig } from "../config/business-api.config";

export class OrganizationApiGateway implements OrganizationCommandService, OrganizationQueryService {
  async create(command: CreateOrganizationCommand, token?: string): Promise<Organization> {
    const authToken = await getBusinessAccessToken(token);
    const resource = await businessPost<OrganizationResource>(businessApiConfig.routes.organizations, command, authToken);
    return toOrganization(resource);
  }

  async getMyOrganization(_query: GetMyOrganizationQuery = {}, token?: string): Promise<Organization> {
    void _query;
    const authToken = await getBusinessAccessToken(token);
    const resource = await businessGet<OrganizationResource>(businessApiConfig.routes.organizations, authToken);
    return toOrganization(resource);
  }

  async getById(query: GetOrganizationByIdQuery, token?: string): Promise<Organization> {
    const authToken = await getBusinessAccessToken(token);
    const resource = await businessGet<OrganizationResource>(
      `${businessApiConfig.routes.organizations}/${encodeURIComponent(query.id)}`,
      authToken
    );
    return toOrganization(resource);
  }

  async update(command: UpdateOrganizationCommand, token?: string): Promise<Organization> {
    const authToken = await getBusinessAccessToken(token);
    const resource = await businessPut<OrganizationResource>(
      `${businessApiConfig.routes.organizations}/${encodeURIComponent(command.id)}`,
      { name: command.name },
      authToken
    );
    return toOrganization(resource);
  }

  async delete(command: DeleteOrganizationCommand, token?: string): Promise<void> {
    const authToken = await getBusinessAccessToken(token);
    await businessDelete(
      `${businessApiConfig.routes.organizations}/${encodeURIComponent(command.id)}`,
      authToken
    );
  }
}

function toOrganization(resource: OrganizationResource): Organization {
  return Organization.create({
    id: createOrganizationId(resource.id),
    ownerId: resource.ownerId,
    name: createOrganizationName(resource.name),
    active: true,
  });
}
