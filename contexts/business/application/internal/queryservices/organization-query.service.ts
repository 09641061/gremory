import "server-only";

import type {
  GetMyOrganizationQuery,
  GetOrganizationByIdQuery,
} from "../../../domain/model/queries/business.queries";
import type { OrganizationQueryService } from "../../../domain/services/business.services";
import { OrganizationApiGateway } from "../../../infrastructure/gateways/organization-api.gateway";

export class OrganizationQueryServiceImpl implements OrganizationQueryService {
  constructor(private readonly gateway: OrganizationQueryService = new OrganizationApiGateway()) {}

  getMyOrganization(query: GetMyOrganizationQuery = {}, token?: string) {
    return this.gateway.getMyOrganization(query, token);
  }

  getById(query: GetOrganizationByIdQuery, token?: string) {
    return this.gateway.getById(query, token);
  }
}

export function createOrganizationQueryService(): OrganizationQueryService {
  return new OrganizationQueryServiceImpl();
}
