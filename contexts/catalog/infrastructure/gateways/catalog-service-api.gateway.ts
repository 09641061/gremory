import "server-only";

import { cookies } from "next/headers";
import { iamSessionCookies } from "@/contexts/iam/infrastructure/session/iam-session-cookie";
import { CatalogService } from "../../domain/model/entities/catalog-service.entity";
import { createCatalogServiceId } from "../../domain/model/valueobjects/catalog-service-id.vo";
import { createPrice } from "../../domain/model/valueobjects/price.vo";
import type {
  CatalogServiceCommandService,
  CatalogServiceSearchParams,
  PageResponse,
} from "../../domain/services/catalog-service.services";
import type {
  CreateCatalogServiceCommand,
  UpdateCatalogServiceCommand,
  ChangeCatalogServiceStatusCommand,
  DeleteCatalogServiceCommand,
} from "../../domain/model/commands/catalog-service.commands";
import { apiConfig } from "@/api.config";
import { apiClient } from "@/contexts/shared/infrastructure/http/api-client";

type RawCatalogService = {
  id: string;
  establishmentId: string;
  name: string;
  description: string;
  price: number;
  durationMinutes: number;
  categoryId?: string | null;
  preServiceInstructions?: string | null;
  postServiceRecommendations?: string | null;
  preparationMinutes: number;
  cleanupMinutes: number;
  status: "ACTIVE" | "INACTIVE" | "DELETED";
};

function mapServiceToEntity(raw: RawCatalogService): CatalogService {
  return CatalogService.create({
    id: createCatalogServiceId(raw.id),
    establishmentId: raw.establishmentId,
    name: raw.name,
    description: raw.description,
    price: createPrice(raw.price),
    durationMinutes: raw.durationMinutes,
    categoryId: raw.categoryId ?? null,
    preServiceInstructions: raw.preServiceInstructions ?? null,
    postServiceRecommendations: raw.postServiceRecommendations ?? null,
    preparationMinutes: raw.preparationMinutes ?? 0,
    cleanupMinutes: raw.cleanupMinutes ?? 0,
    status: raw.status,
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

export class CatalogServiceApiGateway
  implements CatalogServiceCommandService
{
  async search(
    params: CatalogServiceSearchParams,
    token?: string
  ): Promise<PageResponse<CatalogService>> {
    const authToken = await resolveAccessToken(token);
    const query = new URLSearchParams();
    query.append("establishmentId", params.establishmentId);
    if (params.categoryId) query.append("categoryId", params.categoryId);
    if (params.search) query.append("search", params.search);
    if (params.active !== undefined) query.append("active", String(params.active));
    if (params.minPrice !== undefined) query.append("minPrice", String(params.minPrice));
    if (params.maxPrice !== undefined) query.append("maxPrice", String(params.maxPrice));
    if (params.minDuration !== undefined) query.append("minDuration", String(params.minDuration));
    if (params.maxDuration !== undefined) query.append("maxDuration", String(params.maxDuration));
    query.append("page", String(params.page ?? 0));
    query.append("size", String(params.size ?? 20));

    const data = await apiClient.get<PageResponse<RawCatalogService>>(
      `${apiConfig.routes.catalogServices}?${query}`,
      {
        token: authToken,
        errorMessage: "Failed to fetch catalog services",
      },
    );

    return {
      ...data,
      content: data.content.map(mapServiceToEntity),
    };
  }

  async getById(id: string, establishmentId: string, token?: string): Promise<CatalogService> {
    const authToken = await resolveAccessToken(token);
    const query = new URLSearchParams({ establishmentId });
    const resource = await apiClient.get<RawCatalogService>(
      `${apiConfig.routes.catalogServices}/${encodeURIComponent(id)}?${query}`,
      {
        token: authToken,
        errorMessage: "Service not found",
      },
    );
    return mapServiceToEntity(resource);
  }

  async create(command: CreateCatalogServiceCommand, token?: string): Promise<CatalogService> {
    const authToken = await resolveAccessToken(token);
    const resource = await apiClient.post<RawCatalogService>(
      apiConfig.routes.catalogServices,
      command,
      {
        token: authToken,
        errorMessage: "Failed to create catalog service",
      },
    );
    return mapServiceToEntity(resource);
  }

  async update(command: UpdateCatalogServiceCommand, token?: string): Promise<CatalogService> {
    const authToken = await resolveAccessToken(token);
    const { id, ...payload } = command;
    const resource = await apiClient.put<RawCatalogService>(
      `${apiConfig.routes.catalogServices}/${encodeURIComponent(id)}`,
      payload,
      {
        token: authToken,
        errorMessage: "Failed to update service",
      },
    );
    return mapServiceToEntity(resource);
  }

  async changeStatus(command: ChangeCatalogServiceStatusCommand, token?: string): Promise<void> {
    const authToken = await resolveAccessToken(token);
    const query = new URLSearchParams({ active: String(command.active) });
    await apiClient.patch<void>(
      `${apiConfig.routes.catalogServices}/${encodeURIComponent(command.id)}/status?${query}`,
      undefined,
      {
        token: authToken,
        errorMessage: "Failed to change service status",
      },
    );
  }

  async delete(command: DeleteCatalogServiceCommand, token?: string): Promise<void> {
    const authToken = await resolveAccessToken(token);
    await apiClient.delete<void>(
      `${apiConfig.routes.catalogServices}/${encodeURIComponent(command.id)}`,
      {
        token: authToken,
        errorMessage: "Failed to delete service",
      },
    );
  }
}
