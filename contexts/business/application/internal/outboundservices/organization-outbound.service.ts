import "server-only";

import { OrganizationApiGateway } from "@/contexts/business/infrastructure/gateways/organization-api.gateway";
import type { Organization } from "../../../domain/model/entities/organization.entity";
import type { OrganizationRepository } from "../../../domain/services/business.repositories";
import type { OrganizationId } from "../../../domain/model/valueobjects/organization-id.vo";
import type { OrganizationName } from "../../../domain/model/valueobjects/organization-name.vo";

export class OrganizationOutboundService implements OrganizationRepository {
  constructor(private readonly gateway = new OrganizationApiGateway()) {}

  create(name: OrganizationName): Promise<Organization> {
    return this.gateway.create(name);
  }

  findMine(): Promise<Organization> {
    return this.gateway.findMine();
  }

  findById(id: OrganizationId): Promise<Organization | null> {
    return this.gateway.findById(id);
  }

  save(organization: Organization): Promise<Organization> {
    return this.gateway.save(organization);
  }
}

export function createOrganizationOutboundService() {
  return new OrganizationOutboundService();
}
