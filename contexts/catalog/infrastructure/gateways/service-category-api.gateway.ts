import "server-only";

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

const apiBaseUrl = process.env.API_BASE_URL ?? "http://localhost:8080";

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

export class ServiceCategoryApiGateway
  implements ServiceCategoryCommandService, ServiceCategoryQueryService
{
  async list(
    establishmentId: string,
    page = 0,
    size = 20,
    token?: string
  ): Promise<PageResponse<ServiceCategory>> {
    const headers: HeadersInit = {};
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(
      `${apiBaseUrl}/api/catalog/categories?establishmentId=${establishmentId}&page=${page}&size=${size}`,
      { headers, cache: "no-store" }
    );

    if (!res.ok) throw new Error("Failed to list categories");

    const data: PageResponse<RawServiceCategory> = await res.json();
    return {
      ...data,
      content: data.content.map(mapCategoryToEntity),
    };
  }

  async create(command: CreateServiceCategoryCommand, token?: string): Promise<ServiceCategory> {
    const headers: HeadersInit = { "Content-Type": "application/json" };
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(`${apiBaseUrl}/api/catalog/categories`, {
      method: "POST",
      headers,
      body: JSON.stringify(command),
      cache: "no-store",
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Failed to create category");
    }

    return mapCategoryToEntity(await res.json());
  }

  async update(command: UpdateServiceCategoryCommand, token?: string): Promise<ServiceCategory> {
    const headers: HeadersInit = { "Content-Type": "application/json" };
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(`${apiBaseUrl}/api/catalog/categories/${command.id}`, {
      method: "PUT",
      headers,
      body: JSON.stringify({ name: command.name }),
      cache: "no-store",
    });

    if (!res.ok) throw new Error("Failed to update category");

    return mapCategoryToEntity(await res.json());
  }

  async delete(command: DeleteServiceCategoryCommand, token?: string): Promise<void> {
    const headers: HeadersInit = {};
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(`${apiBaseUrl}/api/catalog/categories/${command.id}`, {
      method: "DELETE",
      headers,
      cache: "no-store",
    });

    if (!res.ok) throw new Error("Failed to delete category");
  }
}
