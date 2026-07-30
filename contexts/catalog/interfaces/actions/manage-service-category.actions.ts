"use server";

import { revalidatePath } from "next/cache";
import { createServiceCategorySchema, updateServiceCategorySchema } from "../rest/schemas/service-category.schemas";
import { createServiceCategoryCommandService } from "../../application/internal/commandservices/service-category-command.service";
import { requireCatalogAccessToken } from "./catalog-action-auth";

export type CategoryActionResult = {
  status: "idle" | "success" | "error";
  error: string | null;
};

export async function createServiceCategoryAction(
  _prevState: CategoryActionResult,
  formData: FormData
): Promise<CategoryActionResult> {
  const rawData = {
    establishmentId: formData.get("establishmentId"),
    name: formData.get("name"),
  };

  const parsed = createServiceCategorySchema.safeParse(rawData);

  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? "Datos de categoría inválidos";
    return { status: "error", error: firstError };
  }

  try {
    const token = await requireCatalogAccessToken();
    const service = createServiceCategoryCommandService();
    await service.create(parsed.data, token);
    revalidatePath("/catalog");
    return { status: "success", error: null };
  } catch (err) {
    return {
      status: "error",
      error: err instanceof Error ? err.message : "Error al crear la categoría",
    };
  }
}

export async function updateServiceCategoryAction(
  _prevState: CategoryActionResult,
  formData: FormData
): Promise<CategoryActionResult> {
  const rawData = {
    id: formData.get("id"),
    name: formData.get("name"),
  };

  const parsed = updateServiceCategorySchema.safeParse(rawData);

  if (!parsed.success) {
    return { status: "error", error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  try {
    const token = await requireCatalogAccessToken();
    const service = createServiceCategoryCommandService();
    await service.update(parsed.data, token);
    revalidatePath("/catalog");
    return { status: "success", error: null };
  } catch (err) {
    return {
      status: "error",
      error: err instanceof Error ? err.message : "Error al actualizar la categoría",
    };
  }
}

export async function deleteServiceCategoryAction(id: string): Promise<CategoryActionResult> {
  try {
    const token = await requireCatalogAccessToken();
    const service = createServiceCategoryCommandService();
    await service.delete({ id }, token);
    revalidatePath("/catalog");
    return { status: "success", error: null };
  } catch (err) {
    return {
      status: "error",
      error: err instanceof Error ? err.message : "Error al eliminar la categoría",
    };
  }
}
