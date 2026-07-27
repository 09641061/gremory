import "server-only";

import { Organization } from "../../domain/model/entities/organization.entity";
import { createOrganizationId } from "../../domain/model/valueobjects/organization-id.vo";
import { createOrganizationName } from "../../domain/model/valueobjects/organization-name.vo";
import type { OrganizationRepository } from "../../domain/services/business.repositories";
import type { OrganizationId } from "../../domain/model/valueobjects/organization-id.vo";
import type { OrganizationResource } from "../../interfaces/rest/resources/business.resources";
import {
  BusinessApiError,
  businessGet,
  businessPut,
} from "../http/business-api.client";
import { requireBusinessAccessToken } from "../session/business-session";
import { apiConfig } from "@/api.config";

export class OrganizationApiGateway implements OrganizationRepository {
  constructor(private readonly providedToken?: string) {}

  async findMine(): Promise<Organization> {
    const authToken = await requireBusinessAccessToken(this.providedToken);
    const resource = await businessGet<OrganizationResource>(apiConfig.routes.organizations, authToken);
    return toOrganization(resource);
  }

  async findById(id: OrganizationId): Promise<Organization | null> {
    const authToken = await requireBusinessAccessToken(this.providedToken);
    try {
      const resource = await businessGet<OrganizationResource>(
        `${apiConfig.routes.organizations}/${encodeURIComponent(id.value)}`,
        authToken
      );
      return toOrganization(resource);
    } catch (error) {
      if (error instanceof BusinessApiError && error.status === 404) return null;
      throw error;
    }
  }

  async save(organization: Organization): Promise<Organization> {
    const authToken = await requireBusinessAccessToken(this.providedToken);
    const resource = await businessPut<OrganizationResource>(
      `${apiConfig.routes.organizations}/${encodeURIComponent(organization.id.value)}`,
      { name: organization.name.value },
      authToken
    );
    return toOrganization(resource);
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
