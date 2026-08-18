"use server";

import { updateTag } from "next/cache";
import { createCatalogServiceSchema } from "../rest/schemas/catalog-service.schemas";
import { createCatalogServiceCommandService } from "../../application/internal/commandservices/catalog-service-command.service";
import { createCatalogServiceReadModel } from "../../application/model/catalog-service.read-model";
import { requireCatalogAccessToken, requireCatalogOrganizationId } from "./catalog-action-auth";
import { createCatalogServiceCreateCommand } from "../../domain/model/commands/catalog-service.commands";
import type { DetailedServiceDTO } from "../../application/model/catalog-view.models";

export type CreateCatalogServiceActionState = {
  status: "idle" | "success" | "error";
  data: DetailedServiceDTO | null;
  error: string | null;
};

export async function createCatalogServiceAction(
  _prevState: CreateCatalogServiceActionState,
  formData: FormData
): Promise<CreateCatalogServiceActionState> {
  const rawData = {
    establishmentId: formData.get("establishmentId"),
    name: formData.get("name"),
    description: formData.get("description"),
    price: formData.get("price"),
    durationMinutes: formData.get("durationMinutes"),
    categoryId: formData.get("categoryId") || undefined,
    preServiceInstructions: formData.get("preServiceInstructions") || undefined,
    postServiceRecommendations: formData.get("postServiceRecommendations") || undefined,
    preparationMinutes: formData.get("preparationMinutes") || 0,
    cleanupMinutes: formData.get("cleanupMinutes") || 0,
  };

  const parsed = createCatalogServiceSchema.safeParse(rawData);

  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? "Invalid form data";
    return { status: "error", data: null, error: firstError };
  }

  try {
    const [token, organizationId] = await Promise.all([
      requireCatalogAccessToken(),
      requireCatalogOrganizationId(parsed.data.establishmentId),
    ]);
    const service = createCatalogServiceCommandService(organizationId);
    const command = createCatalogServiceCreateCommand(parsed.data);
    const result = await service.create(command, token);

    updateTag("catalog-services");
    updateTag(`catalog-services:${parsed.data.establishmentId}`);

    return {
      status: "success",
      data: createCatalogServiceReadModel(result),
      error: null,
    };
  } catch (err) {
    return {
      status: "error",
      data: null,
      error: err instanceof Error ? err.message : "Unexpected error while creating the service",
    };
  }
}
