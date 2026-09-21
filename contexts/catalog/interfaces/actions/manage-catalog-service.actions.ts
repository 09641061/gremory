"use server";

import { safePublicError } from "@/contexts/shared/interfaces/actions/safe-error";


import { updateTag } from "next/cache";
import { updateCatalogServiceSchema } from "../rest/schemas/catalog-service.schemas";
import { createCatalogServiceCommandService } from "../../application/internal/commandservices/catalog-service-command.service";
import { requireCatalogAccessToken, requireCatalogOrganizationId } from "./catalog-action-auth";
import { createCatalogServiceUpdateCommand } from "../../domain/model/commands/catalog-service.commands";
import { requireCatalogServiceTargetAuthorization } from "@/contexts/catalog/interfaces/authorization/catalog-authorization";

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

  const parsed = updateCatalogServiceSchema.safeParse(rawData);

  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? "Invalid data";
    return { status: "error", error: firstError };
  }

  try {
    await requireCatalogServiceTargetAuthorization(String(parsed.data.id));
    const [token, organizationId] = await Promise.all([
      requireCatalogAccessToken(),
      requireCatalogOrganizationId(),
    ]);
    const service = createCatalogServiceCommandService(organizationId);
    const command = createCatalogServiceUpdateCommand(parsed.data);
    await service.update(command, token);

    updateTag("catalog-services");
    updateTag(`catalog-service:${parsed.data.id}`);
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
  active: boolean
): Promise<CatalogServiceActionResult> {
  try {
    await requireCatalogServiceTargetAuthorization(id);
    const [token, organizationId] = await Promise.all([
      requireCatalogAccessToken(),
      requireCatalogOrganizationId(),
    ]);
    const service = createCatalogServiceCommandService(organizationId);
    await service.changeStatus({ id, active }, token);
    updateTag("catalog-services");
    updateTag(`catalog-service:${id}`);
    return { status: "success", error: null };
  } catch (err) {
    return {
      status: "error",
      error: safePublicError(err, "Error while changing the service status").message,
    };
  }
}

export async function deleteCatalogServiceAction(
  id: string
): Promise<CatalogServiceActionResult> {
  try {
    await requireCatalogServiceTargetAuthorization(id);
    const [token, organizationId] = await Promise.all([
      requireCatalogAccessToken(),
      requireCatalogOrganizationId(),
    ]);
    const service = createCatalogServiceCommandService(organizationId);
    await service.delete({ id }, token);
    updateTag("catalog-services");
    updateTag(`catalog-service:${id}`);
    return { status: "success", error: null };
  } catch (err) {
    return {
      status: "error",
      error: safePublicError(err, "Error while deleting the service").message,
    };
  }
}
