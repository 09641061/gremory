import "server-only";

import type { PageResponse } from "../../../domain/services/catalog-service.services";
import type { ServiceCategoryQueryService } from "../../../domain/services/service-category.services";
import type { CategoryDTO } from "../../model/catalog-view.models";
import { ServiceCategoryApiGateway } from "../../../infrastructure/gateways/service-category-api.gateway";
import { cacheLife, cacheTag } from "next/cache";
import { createServiceCategoryReadModel } from "../../model/service-category.read-model";

export class ServiceCategoryQueryServiceImpl implements ServiceCategoryQueryService {
  list(
    establishmentId: string,
    page?: number,
    size?: number,
    token?: string
  ): Promise<PageResponse<CategoryDTO>> {
    return listServiceCategoriesCached(establishmentId, page, size, token);
  }
}

export function createServiceCategoryQueryService() {
  return new ServiceCategoryQueryServiceImpl();
}

async function resolveAccessToken(providedToken?: string): Promise<string | undefined> {
  if (providedToken) return providedToken;
  const { cookies } = await import("next/headers");
  const { iamSessionCookies } = await import("@/contexts/iam/infrastructure/session/iam-session-cookie");
  const cookieStore = await cookies();
  return cookieStore.get(iamSessionCookies.accessToken)?.value;
}

async function listServiceCategoriesCached(
  establishmentId: string,
  page?: number,
  size?: number,
  token?: string
): Promise<PageResponse<CategoryDTO>> {
  "use cache";
  cacheLife("minutes");
  cacheTag("catalog-categories");
  cacheTag(`catalog-categories:${establishmentId}`);

  const authToken = await resolveAccessToken(token);
  const result = await new ServiceCategoryApiGateway().list(establishmentId, page, size, authToken);
  return {
    ...result,
    content: result.content.map(createServiceCategoryReadModel),
  };
}
