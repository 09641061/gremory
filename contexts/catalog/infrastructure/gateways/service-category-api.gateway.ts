import "server-only";

import { cookies } from "next/headers";
import { iamSessionCookies } from "@/contexts/iam/infrastructure/session/iam-session-cookie";
import { ServiceCategory } from "../../domain/model/entities/service-category.entity";
import { createCategoryId } from "../../domain/model/valueobjects/category-id.vo";
import type {
  ServiceCategoryCommandService,
  ServiceCategoryQueryService,
} from "../../domain/services/service-category.services";
import type {
  CreateServiceCategoryCommand,
  UpdateServiceCategoryCommand,
  DeleteServiceCategoryCommand,
} from "../../domain/model/commands/service-category.commands";
import type { PageResponse } from "../../domain/services/catalog-service.services";
import { apiConfig } from "@/api.config";
import { apiClient } from "@/contexts/shared/infrastructure/http/api-client";

type RawServiceCategory = {
  id: string;
  establishmentId: string;
  name: string;
};

function mapCategoryToEntity(raw: RawServiceCategory): ServiceCategory {
  return ServiceCategory.create({
    id: createCategoryId(raw.id),
    establishmentId: raw.establishmentId,
    name: raw.name,
  });
}

async function resolveAccessToken(providedToken?: string): Promise<string | undefined> {
  if (providedToken) return providedToken;
  try {
    const cookieStore = await cookies();
    return cookieStore.get(iamSessionCookies.accessToken)?.value;
  } catch {
    return undefined;
  }
}

export class ServiceCategoryApiGateway
  implements ServiceCategoryCommandService, ServiceCategoryQueryService
{
  async list(
    establishmentId: string,
    page = 0,
    size = 20,
    token?: string
  ): Promise<PageResponse<ServiceCategory>> {
    const authToken = await resolveAccessToken(token);
    const query = new URLSearchParams({
      establishmentId,
      page: String(page),
      size: String(size),
    });
    const data = await apiClient.get<PageResponse<RawServiceCategory>>(
      `${apiConfig.routes.catalogCategories}?${query}`,
      {
        token: authToken,
        errorMessage: "Failed to list categories",
      },
    );

    return {
      ...data,
      content: data.content.map(mapCategoryToEntity),
    };
  }

  async create(command: CreateServiceCategoryCommand, token?: string): Promise<ServiceCategory> {
    const authToken = await resolveAccessToken(token);
    const resource = await apiClient.post<RawServiceCategory>(
      apiConfig.routes.catalogCategories,
      command,
      {
        token: authToken,
        errorMessage: "Failed to create category",
      },
    );
    return mapCategoryToEntity(resource);
  }

  async update(command: UpdateServiceCategoryCommand, token?: string): Promise<ServiceCategory> {
    const authToken = await resolveAccessToken(token);
    const resource = await apiClient.put<RawServiceCategory>(
      `${apiConfig.routes.catalogCategories}/${encodeURIComponent(command.id)}`,
      { name: command.name },
      {
        token: authToken,
        errorMessage: "Failed to update category",
      },
    );
    return mapCategoryToEntity(resource);
  }

  async delete(command: DeleteServiceCategoryCommand, token?: string): Promise<void> {
    const authToken = await resolveAccessToken(token);
    await apiClient.delete<void>(
      `${apiConfig.routes.catalogCategories}/${encodeURIComponent(command.id)}`,
      {
        token: authToken,
        errorMessage: "Failed to delete category",
      },
    );
  }
}
