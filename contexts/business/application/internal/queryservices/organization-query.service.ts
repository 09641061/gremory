import "server-only";

import type {
  GetMyOrganizationQuery,
  GetOrganizationByIdQuery,
} from "../../../domain/model/queries/business.queries";
import { createOrganizationId } from "../../../domain/model/valueobjects/organization-id.vo";
import type { OrganizationRepository } from "../../../domain/services/business.repositories";
import type { OrganizationQueryService } from "../../services/business.services";
import type { OrganizationSummary } from "../../model/business.read-models";
import { OrganizationApiGateway } from "@/contexts/business/infrastructure/gateways/organization-api.gateway";
import type { AccessibleOrganizationResource } from "@/contexts/business/interfaces/rest/schemas/accessible-organization.schemas";

/** Only the accessible-organizations lookup, so tests can stub it without implementing the full repository. */
interface AccessibleOrganizationSource {
  findAccessible(): Promise<AccessibleOrganizationResource[]>;
}

export class OrganizationQueryServiceImpl implements OrganizationQueryService {
  constructor(
    private readonly organizations: OrganizationRepository,
    private readonly accessibleOrganizations: AccessibleOrganizationSource = new OrganizationApiGateway(),
  ) {}

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

  async getAccessible(): Promise<AccessibleOrganizationResource[]> {
    return this.accessibleOrganizations.findAccessible();
  }
}

export function createOrganizationQueryService(
): OrganizationQueryService {
  return new OrganizationQueryServiceImpl(new OrganizationApiGateway());
}

function toOrganizationSummary(
  organization: Awaited<ReturnType<OrganizationRepository["findMine"]>>,
): OrganizationSummary {
  return {
    id: organization.id.value,
    ownerId: organization.ownerId,
    name: organization.name.value,
    imageUrl: organization.imageUrl.value,
  };
}
