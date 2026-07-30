import "server-only";

import type {
  CatalogServiceQueryService,
  CatalogServiceSearchParams,
  PageResponse,
} from "../../../domain/services/catalog-service.services";
import type { DetailedServiceDTO } from "../../model/catalog-view.models";
import { CatalogServiceApiGateway } from "../../../infrastructure/gateways/catalog-service-api.gateway";
import { cacheLife, cacheTag } from "next/cache";
import { createCatalogServiceReadModel } from "../../model/catalog-service.read-model";

export class CatalogServiceQueryServiceImpl implements CatalogServiceQueryService {
  async search(
    params: CatalogServiceSearchParams,
    token?: string
  ): Promise<PageResponse<DetailedServiceDTO>> {
    const authToken = await resolveAccessToken(token);
    return listCatalogServicesCached(params, authToken);
  }

  async getById(id: string, establishmentId: string, token?: string): Promise<DetailedServiceDTO> {
    const authToken = await resolveAccessToken(token);
    return getCatalogServiceByIdCached(id, establishmentId, authToken);
  }
}

export function createCatalogServiceQueryService() {
  return new CatalogServiceQueryServiceImpl();
}

async function resolveAccessToken(providedToken?: string): Promise<string | undefined> {
  if (providedToken) return providedToken;
  const { cookies } = await import("next/headers");
  const { iamSessionCookies } = await import("@/contexts/iam/infrastructure/session/iam-session-cookie");
  const cookieStore = await cookies();
  return cookieStore.get(iamSessionCookies.accessToken)?.value;
}

async function listCatalogServicesCached(
  params: CatalogServiceSearchParams,
  token?: string
): Promise<PageResponse<DetailedServiceDTO>> {
  "use cache";
  cacheLife("minutes");
  cacheTag("catalog-services");
  if (params.establishmentId) cacheTag(`catalog-services:${params.establishmentId}`);

  const page = await new CatalogServiceApiGateway().search(params, token);
  return {
    ...page,
    content: page.content.map(createCatalogServiceReadModel),
  };
}

async function getCatalogServiceByIdCached(
  id: string,
  establishmentId: string,
  token?: string
): Promise<DetailedServiceDTO> {
  "use cache";
  cacheLife("minutes");
  cacheTag("catalog-services");
  cacheTag(`catalog-services:${establishmentId}`);
  cacheTag(`catalog-service:${id}`);

  const service = await new CatalogServiceApiGateway().getById(id, establishmentId, token);
  return createCatalogServiceReadModel(service);
}
