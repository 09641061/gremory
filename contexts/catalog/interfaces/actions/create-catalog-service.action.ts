"use server";

import { revalidateTag } from "next/cache";
import { createCatalogServiceSchema } from "../rest/schemas/catalog-service.schemas";
import { createCatalogServiceCommandService } from "../../application/internal/commandservices/catalog-service-command.service";
import { requireCatalogAccessToken } from "./catalog-action-auth";
import { createCatalogServiceCreateCommand } from "../../domain/model/commands/catalog-service.commands";

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
    const token = await requireCatalogAccessToken();
    const service = createCatalogServiceCommandService();
    const command = createCatalogServiceCreateCommand(parsed.data);
    const result = await service.create(command, token);

    revalidateTag("catalog-services", "max");

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
