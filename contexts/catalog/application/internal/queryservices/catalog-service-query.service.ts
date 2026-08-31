import "server-only";

import type {
  CatalogServiceQueryService,
  CatalogServiceSearchParams,
  PageResponse,
} from "../../../domain/services/catalog-service.services";
import type { DetailedServiceDTO } from "../../model/catalog-view.models";
import { CatalogServiceApiGateway } from "../../../infrastructure/gateways/catalog-service-api.gateway";
import { createCatalogServiceReadModel } from "../../model/catalog-service.read-model";

export class CatalogServiceQueryServiceImpl implements CatalogServiceQueryService {
  constructor(private readonly organizationId?: string) {}

  async search(
    params: CatalogServiceSearchParams,
    token?: string
  ): Promise<PageResponse<DetailedServiceDTO>> {
    const authToken = await resolveAccessToken(token);
    const page = await new CatalogServiceApiGateway(this.organizationId).search(params, authToken);
    return {
      ...page,
      content: page.content.map(createCatalogServiceReadModel),
    };
  }

  async getById(id: string, establishmentId: string, token?: string): Promise<DetailedServiceDTO> {
    const authToken = await resolveAccessToken(token);
    const service = await new CatalogServiceApiGateway(this.organizationId).getById(id, establishmentId, authToken);
    return createCatalogServiceReadModel(service);
  }
}

export function createCatalogServiceQueryService(organizationId?: string) {
  return new CatalogServiceQueryServiceImpl(organizationId);
}

async function resolveAccessToken(providedToken?: string): Promise<string | undefined> {
  if (providedToken) return providedToken;
  const { cookies } = await import("next/headers");
  const { iamSessionCookies } = await import("@/contexts/iam/infrastructure/session/iam-session-cookie");
  const cookieStore = await cookies();
  return cookieStore.get(iamSessionCookies.accessToken)?.value;
}
