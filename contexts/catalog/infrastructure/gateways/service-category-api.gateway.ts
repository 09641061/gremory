import "server-only";

import { cookies } from "next/headers";
import { iamSessionCookies } from "@/contexts/iam/infrastructure/session/iam-session-cookie";
import { workspaceSelectionCookies } from "@/contexts/business/infrastructure/session/workspace-selection-cookie";
import { ServiceCategory } from "../../domain/model/entities/service-category.entity";
import { createCategoryId } from "../../domain/model/valueobjects/category-id.vo";
import type {
  ServiceCategoryCommandService,
} from "../../domain/services/service-category.services";
import type {
  CreateServiceCategoryCommand,
  UpdateServiceCategoryCommand,
  DeleteServiceCategoryCommand,
} from "../../domain/model/commands/service-category.commands";
import type { PageResponse } from "@/contexts/shared/domain/model/page-response";
import type { CategoryDTO } from "../../domain/model/view-models";
import { apiConfig } from "@/api.config";
import { apiClient } from "@/contexts/shared/infrastructure/http/api-client";
import { serviceCategoryResponseSchema } from "../../interfaces/rest/schemas/service-category.schemas";
import { serviceCategoryPageResponseSchema } from "../contracts/catalog-response.contracts";
import type { ServiceCategoryApiPort } from "../../application/ports/service-category-port";

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

function mapCategoryToDTO(raw: RawServiceCategory): CategoryDTO {
  return {
    id: raw.id,
    establishmentId: raw.establishmentId,
    name: raw.name,
  };
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
  implements ServiceCategoryCommandService, ServiceCategoryApiPort
{
  constructor(private readonly organizationId?: string) {}

  private async tenantOptions(): Promise<{ tenantId?: string }> {
    let organizationId = this.organizationId;
    if (!organizationId) {
      try {
        const cookieStore = await cookies();
        organizationId = cookieStore.get(workspaceSelectionCookies.organizationId)?.value;
      } catch {
        // Cookie access is unavailable outside a request.
      }
    }
    return { tenantId: organizationId };
  }

  async list(
    establishmentId: string,
    page: number | undefined = 0,
    size: number | undefined = 20,
    token?: string
  ): Promise<PageResponse<CategoryDTO>> {
    const authToken = await resolveAccessToken(token);
    const query = new URLSearchParams({
      establishmentId,
      page: String(page),
      size: String(size),
    });
    const resource = await apiClient.get<unknown>(
      `${apiConfig.routes.catalogCategories}?${query}`,
      {
        token: authToken,
        ...(await this.tenantOptions()),
        errorMessage: "Failed to list categories",
      },
    );

    const data = serviceCategoryPageResponseSchema.parse(resource);
    return {
      ...data,
      content: data.content.map(mapCategoryToDTO),
    };
  }

  async getById(
    id: string,
    establishmentId: string,
    token?: string,
  ): Promise<CategoryDTO | null> {
    const authToken = await resolveAccessToken(token);
    try {
      const resource = await apiClient.get<unknown>(
        `${apiConfig.routes.catalogCategories}/${encodeURIComponent(id)}?establishmentId=${encodeURIComponent(establishmentId)}`,
        {
          token: authToken,
          ...(await this.tenantOptions()),
          errorMessage: "Failed to fetch category",
        },
      );
      return mapCategoryToDTO(serviceCategoryResponseSchema.parse(resource));
    } catch (error) {
      if (error instanceof Error && "status" in error && (error as { status?: unknown }).status === 404) {
        return null;
      }
      throw error;
    }
  }

  async create(command: CreateServiceCategoryCommand, token?: string): Promise<ServiceCategory> {
    const authToken = await resolveAccessToken(token);
    const resource = await apiClient.post<RawServiceCategory>(
      apiConfig.routes.catalogCategories,
      command,
      {
        token: authToken,
        ...(await this.tenantOptions()),
        errorMessage: "Failed to create category",
      },
    );
    return mapCategoryToEntity(serviceCategoryResponseSchema.parse(resource));
  }

  async update(command: UpdateServiceCategoryCommand, token?: string): Promise<ServiceCategory> {
    const authToken = await resolveAccessToken(token);
    const resource = await apiClient.put<RawServiceCategory>(
      `${apiConfig.routes.catalogCategories}/${encodeURIComponent(command.id)}`,
      { name: command.name },
      {
        token: authToken,
        ...(await this.tenantOptions()),
        errorMessage: "Failed to update category",
      },
    );
    return mapCategoryToEntity(serviceCategoryResponseSchema.parse(resource));
  }

  async delete(command: DeleteServiceCategoryCommand, token?: string): Promise<void> {
    const authToken = await resolveAccessToken(token);
    await apiClient.delete<void>(
      `${apiConfig.routes.catalogCategories}/${encodeURIComponent(command.id)}`,
      {
        token: authToken,
        ...(await this.tenantOptions()),
        errorMessage: "Failed to delete category"
      },
    );
  }
}
