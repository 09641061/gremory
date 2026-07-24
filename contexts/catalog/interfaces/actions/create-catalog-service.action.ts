"use server";

import { revalidatePath } from "next/cache";
import { createCatalogServiceSchema } from "../rest/schemas/catalog-service.schemas";
import { createCatalogServiceCommandService } from "../../application/internal/commandservices/catalog-service-command.service";

export type CreateCatalogServiceActionState = {
  status: "idle" | "success" | "error";
  data: { id?: string } | null;
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
    const firstError = parsed.error.issues[0]?.message ?? "Datos inválidos en el formulario";
    return { status: "error", data: null, error: firstError };
  }

  try {
    const service = createCatalogServiceCommandService();
    const result = await service.create({
      ...parsed.data,
      categoryId: parsed.data.categoryId || null,
      preServiceInstructions: parsed.data.preServiceInstructions || null,
      postServiceRecommendations: parsed.data.postServiceRecommendations || null,
    });

    revalidatePath("/catalog");

    return {
      status: "success",
      data: { id: result.props.id.value },
      error: null,
    };
  } catch (err) {
    return {
      status: "error",
      data: null,
      error: err instanceof Error ? err.message : "Error inesperado al crear el servicio",
    };
  }
}
