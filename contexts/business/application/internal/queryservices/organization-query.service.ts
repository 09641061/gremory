import "server-only";

import type {
  GetMyOrganizationQuery,
  GetOrganizationByIdQuery,
} from "../../../domain/model/queries/business.queries";
import { createOrganizationId } from "../../../domain/model/valueobjects/organization-id.vo";
import type { OrganizationRepository } from "../../../domain/services/business.repositories";
import type { OrganizationQueryService } from "../../services/business.services";
import type { OrganizationSummary } from "../../model/business.read-models";
import { OrganizationApiGateway } from "../../../infrastructure/gateways/organization-api.gateway";

export class OrganizationQueryServiceImpl implements OrganizationQueryService {
  constructor(private readonly organizations: OrganizationRepository) {}

  async getMyOrganization(
    query: GetMyOrganizationQuery = {},
  ): Promise<OrganizationSummary> {
    void query;
    return toOrganizationSummary(await this.organizations.findMine());
  }

  async getById(
    query: GetOrganizationByIdQuery,
  ): Promise<OrganizationSummary | null> {
    const organization = await this.organizations.findById(
      createOrganizationId(query.id),
    );
    return organization ? toOrganizationSummary(organization) : null;
  }
}

export function createOrganizationQueryService(
  token?: string,
): OrganizationQueryService {
  return new OrganizationQueryServiceImpl(new OrganizationApiGateway(token));
}

function toOrganizationSummary(
  organization: Awaited<ReturnType<OrganizationRepository["findMine"]>>,
): OrganizationSummary {
  return {
    id: organization.id.value,
    ownerId: organization.ownerId,
    name: organization.name.value,
    active: organization.active,
  };
}
