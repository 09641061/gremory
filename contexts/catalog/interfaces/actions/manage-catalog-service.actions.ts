"use server";

import { revalidatePath } from "next/cache";
import { updateCatalogServiceSchema } from "../rest/schemas/catalog-service.schemas";
import { createCatalogServiceCommandService } from "../../application/internal/commandservices/catalog-service-command.service";

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
    const firstError = parsed.error.issues[0]?.message ?? "Datos inválidos";
    return { status: "error", error: firstError };
  }

  try {
    const service = createCatalogServiceCommandService();
    await service.update({
      ...parsed.data,
      categoryId: parsed.data.categoryId || null,
      preServiceInstructions: parsed.data.preServiceInstructions || null,
      postServiceRecommendations: parsed.data.postServiceRecommendations || null,
    });

    revalidatePath("/catalog");
    return { status: "success", error: null };
  } catch (err) {
    return {
      status: "error",
      error: err instanceof Error ? err.message : "Error al actualizar el servicio",
    };
  }
}

export async function changeCatalogServiceStatusAction(
  id: string,
  active: boolean
): Promise<CatalogServiceActionResult> {
  try {
    const service = createCatalogServiceCommandService();
    await service.changeStatus({ id, active });
    revalidatePath("/catalog");
    return { status: "success", error: null };
  } catch (err) {
    return {
      status: "error",
      error: err instanceof Error ? err.message : "Error al cambiar estado del servicio",
    };
  }
}

export async function deleteCatalogServiceAction(
  id: string
): Promise<CatalogServiceActionResult> {
  try {
    const service = createCatalogServiceCommandService();
    await service.delete({ id });
    revalidatePath("/catalog");
    return { status: "success", error: null };
  } catch (err) {
    return {
      status: "error",
      error: err instanceof Error ? err.message : "Error al eliminar el servicio",
    };
  }
}
