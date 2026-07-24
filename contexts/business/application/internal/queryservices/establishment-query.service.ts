import "server-only";

import type {
  GetEstablishmentByIdQuery,
  ListEstablishmentsByOrganizationQuery,
} from "../../../domain/model/queries/business.queries";
import type { EstablishmentQueryService } from "../../../domain/services/business.services";
import { EstablishmentApiGateway } from "../../../infrastructure/gateways/establishment-api.gateway";

export class EstablishmentQueryServiceImpl implements EstablishmentQueryService {
  constructor(private readonly gateway: EstablishmentQueryService = new EstablishmentApiGateway()) {}

  getById(query: GetEstablishmentByIdQuery, token?: string) {
    return this.gateway.getById(query, token);
  }

  getByOrganization(query: ListEstablishmentsByOrganizationQuery, token?: string): ReturnType<EstablishmentQueryService["getByOrganization"]>;
  getByOrganization(organizationId: string, page?: number, size?: number, token?: string): ReturnType<EstablishmentQueryService["getByOrganization"]>;
  getByOrganization(
    queryOrOrganizationId: ListEstablishmentsByOrganizationQuery | string,
    pageOrToken?: number | string,
    size?: number,
    token?: string
  ) {
    if (typeof queryOrOrganizationId === "string") {
      return this.gateway.getByOrganization(
        queryOrOrganizationId,
        pageOrToken as number | undefined,
        size,
        token
      );
    }
    return this.gateway.getByOrganization(queryOrOrganizationId, pageOrToken as string | undefined);
  }
}

export function createEstablishmentQueryService(): EstablishmentQueryService {
  return new EstablishmentQueryServiceImpl();
}
