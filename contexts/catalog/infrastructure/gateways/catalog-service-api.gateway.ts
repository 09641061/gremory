import "server-only";

import { cookies } from "next/headers";
import { iamSessionCookies } from "@/contexts/iam/infrastructure/session/iam-session-cookie";
import { CatalogService } from "../../domain/model/entities/catalog-service.entity";
import { createCatalogServiceId } from "../../domain/model/valueobjects/catalog-service-id.vo";
import { createPrice } from "../../domain/model/valueobjects/price.vo";
import type {
  CatalogServiceCommandService,
  CatalogServiceQueryService,
  CatalogServiceSearchParams,
  PageResponse,
} from "../../domain/services/catalog-service.services";
import type {
  CreateCatalogServiceCommand,
  UpdateCatalogServiceCommand,
  ChangeCatalogServiceStatusCommand,
  DeleteCatalogServiceCommand,
} from "../../domain/model/commands/catalog-service.commands";

const apiBaseUrl = process.env.API_BASE_URL ?? "http://localhost:8080";

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
  implements CatalogServiceCommandService, CatalogServiceQueryService
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

    const headers: HeadersInit = {};
    if (authToken) headers.Authorization = `Bearer ${authToken}`;

    const res = await fetch(`${apiBaseUrl}/api/catalog/services?${query.toString()}`, {
      headers,
      cache: "no-store",
    });

    if (!res.ok) throw new Error("Failed to fetch catalog services");

    const data: PageResponse<RawCatalogService> = await res.json();
    return {
      ...data,
      content: data.content.map(mapServiceToEntity),
    };
  }

  async getById(id: string, establishmentId: string, token?: string): Promise<CatalogService> {
    const authToken = await resolveAccessToken(token);
    const headers: HeadersInit = {};
    if (authToken) headers.Authorization = `Bearer ${authToken}`;

    const res = await fetch(
      `${apiBaseUrl}/api/catalog/services/${id}?establishmentId=${establishmentId}`,
      { headers, cache: "no-store" }
    );

    if (!res.ok) throw new Error("Service not found");
    return mapServiceToEntity(await res.json());
  }

  async create(command: CreateCatalogServiceCommand, token?: string): Promise<CatalogService> {
    const authToken = await resolveAccessToken(token);
    const headers: HeadersInit = { "Content-Type": "application/json" };
    if (authToken) headers.Authorization = `Bearer ${authToken}`;

    const res = await fetch(`${apiBaseUrl}/api/catalog/services`, {
      method: "POST",
      headers,
      body: JSON.stringify(command),
      cache: "no-store",
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Failed to create catalog service");
    }

    return mapServiceToEntity(await res.json());
  }

  async update(command: UpdateCatalogServiceCommand, token?: string): Promise<CatalogService> {
    const authToken = await resolveAccessToken(token);
    const headers: HeadersInit = { "Content-Type": "application/json" };
    if (authToken) headers.Authorization = `Bearer ${authToken}`;

    const { id, ...payload } = command;
    const res = await fetch(`${apiBaseUrl}/api/catalog/services/${id}`, {
      method: "PUT",
      headers,
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Failed to update service");
    }

    return mapServiceToEntity(await res.json());
  }

  async changeStatus(command: ChangeCatalogServiceStatusCommand, token?: string): Promise<void> {
    const authToken = await resolveAccessToken(token);
    const headers: HeadersInit = {};
    if (authToken) headers.Authorization = `Bearer ${authToken}`;

    const res = await fetch(
      `${apiBaseUrl}/api/catalog/services/${command.id}/status?active=${command.active}`,
      { method: "PATCH", headers, cache: "no-store" }
    );

    if (!res.ok) throw new Error("Failed to change service status");
  }

  async delete(command: DeleteCatalogServiceCommand, token?: string): Promise<void> {
    const authToken = await resolveAccessToken(token);
    const headers: HeadersInit = {};
    if (authToken) headers.Authorization = `Bearer ${authToken}`;

    const res = await fetch(`${apiBaseUrl}/api/catalog/services/${command.id}`, {
      method: "DELETE",
      headers,
      cache: "no-store",
    });

    if (!res.ok) throw new Error("Failed to delete service");
  }
}
