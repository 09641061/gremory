"use server";

import { createServiceCategorySchema, updateServiceCategorySchema } from "../rest/schemas/service-category.schemas";
import { createServiceCategoryCommandService } from "../../application/internal/commandservices/service-category-command.service";
import { createServiceCategoryCreateCommand, createServiceCategoryUpdateCommand } from "../../domain/model/commands/service-category.commands";
import { requireCatalogContext, requireCatalogCategoryTargetAuthorization } from "../authorization/catalog-authorization";
import { safePublicError } from "@/contexts/shared/interfaces/actions/safe-error";
import { composeCatalogAdapters } from "../server/catalog-composition";

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
    const firstError = parsed.error.issues[0]?.message ?? "Invalid category data";
    return { status: "error", error: firstError };
  }

  try {
    const context = await requireCatalogContext("catalog:manage", parsed.data.establishmentId);
    const token = context.token;
    const adapters = composeCatalogAdapters();
    const service = createServiceCategoryCommandService(adapters.categoryGateway);
    const command = createServiceCategoryCreateCommand(parsed.data);
    await service.create(command, token);
    return { status: "success", error: null };
  } catch (err) {
    return {
      status: "error",
      error: safePublicError(err, "Error while creating the category").message,
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
    return { status: "error", error: parsed.error.issues[0]?.message ?? "Invalid data" };
  }

  try {
    const context = await requireCatalogCategoryTargetAuthorization(parsed.data.id);
    const token = context.token;
    const adapters = composeCatalogAdapters();
    const service = createServiceCategoryCommandService(adapters.categoryGateway);
    const command = createServiceCategoryUpdateCommand(parsed.data);
    await service.update(command, token);
    return { status: "success", error: null };
  } catch (err) {
    return {
      status: "error",
      error: safePublicError(err, "Error while updating the category").message,
    };
  }
}

export async function deleteServiceCategoryAction(id: string): Promise<CategoryActionResult> {
  try {
    const context = await requireCatalogCategoryTargetAuthorization(id);
    const token = context.token;
    const adapters = composeCatalogAdapters();
    const service = createServiceCategoryCommandService(adapters.categoryGateway);
    await service.delete({ id }, token);
    return { status: "success", error: null };
  } catch (err) {
    return {
      status: "error",
      error: safePublicError(err, "Error while deleting the category").message,
    };
  }
}
