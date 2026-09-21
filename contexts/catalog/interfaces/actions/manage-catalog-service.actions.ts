"use server";

import { z } from "zod";
import { safePublicError } from "@/contexts/shared/interfaces/actions/safe-error";


import { updateCatalogServiceSchema } from "../rest/schemas/catalog-service.schemas";

import { createCatalogServiceUpdateCommand } from "../../domain/model/commands/catalog-service.commands";
import { requireCatalogServiceTargetAuthorization } from "@/contexts/catalog/interfaces/authorization/catalog-authorization";
import { composeCatalogAdapters } from "../server/catalog-composition";

export type CatalogServiceActionResult = {
  status: "idle" | "success" | "error";
  error: string | null;
};

export async function updateCatalogServiceAction(
  _prevState: CatalogServiceActionResult,
  formData: FormData
): Promise<CatalogServiceActionResult> {
  const rawData = {
    id: formData.get("id"),
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

  const parsed = updateCatalogServiceSchema.extend({
    establishmentId: z.string().uuid("Invalid establishment ID"),
  }).safeParse(rawData);

  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? "Invalid data";
    return { status: "error", error: firstError };
  }

  try {
    const { establishmentId, ...updateInput } = parsed.data;
    const auth = await requireCatalogServiceTargetAuthorization(
      String(updateInput.id),
      "catalog:manage",
      establishmentId,
    );
    const token = auth.token;
    const service = composeCatalogAdapters(auth.organizationId).serviceCommandService;
    const command = createCatalogServiceUpdateCommand(updateInput);
    await service.update(command, token);

    return { status: "success", error: null };
  } catch (err) {
    return {
      status: "error",
      error: safePublicError(err, "Error while updating the service").message,
    };
  }
}

export async function changeCatalogServiceStatusAction(
  id: string,
  active: boolean,
  establishmentId?: string,
): Promise<CatalogServiceActionResult> {
  try {
    const auth = await requireCatalogServiceTargetAuthorization(id, "catalog:manage", establishmentId);
    const token = auth.token;
    const service = composeCatalogAdapters(auth.organizationId).serviceCommandService;
    await service.changeStatus({ id, active }, token);
    return { status: "success", error: null };
  } catch (err) {
    return {
      status: "error",
      error: safePublicError(err, "Error while changing the service status").message,
    };
  }
}

export async function deleteCatalogServiceAction(
  id: string,
  establishmentId?: string,
): Promise<CatalogServiceActionResult> {
  try {
    const auth = await requireCatalogServiceTargetAuthorization(id, "catalog:manage", establishmentId);
    const token = auth.token;
    const service = composeCatalogAdapters(auth.organizationId).serviceCommandService;
    await service.delete({ id }, token);
    return { status: "success", error: null };
  } catch (err) {
    return {
      status: "error",
      error: safePublicError(err, "Error while deleting the service").message,
    };
  }
}
