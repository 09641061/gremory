"use server";

import { updateTag } from "next/cache";
import { createServiceCategorySchema, updateServiceCategorySchema } from "../rest/schemas/service-category.schemas";
import { createServiceCategoryCommandService } from "../../application/internal/commandservices/service-category-command.service";
import { requireCatalogAccessToken, requireCatalogOrganizationId } from "./catalog-action-auth";
import { createServiceCategoryCreateCommand, createServiceCategoryUpdateCommand } from "../../domain/model/commands/service-category.commands";

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
    const [token, organizationId] = await Promise.all([
      requireCatalogAccessToken(),
      requireCatalogOrganizationId(parsed.data.establishmentId),
    ]);
    const service = createServiceCategoryCommandService(organizationId);
    const command = createServiceCategoryCreateCommand(parsed.data);
    await service.create(command, token);
    updateTag("catalog-categories");
    updateTag(`catalog-categories:${parsed.data.establishmentId}`);
    return { status: "success", error: null };
  } catch (err) {
    return {
      status: "error",
      error: err instanceof Error ? err.message : "Error while creating the category",
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
    const [token, organizationId] = await Promise.all([
      requireCatalogAccessToken(),
      requireCatalogOrganizationId(),
    ]);
    const service = createServiceCategoryCommandService(organizationId);
    const command = createServiceCategoryUpdateCommand(parsed.data);
    await service.update(command, token);
    updateTag("catalog-categories");
    return { status: "success", error: null };
  } catch (err) {
    return {
      status: "error",
      error: err instanceof Error ? err.message : "Error while updating the category",
    };
  }
}

export async function deleteServiceCategoryAction(id: string): Promise<CategoryActionResult> {
  try {
    const [token, organizationId] = await Promise.all([
      requireCatalogAccessToken(),
      requireCatalogOrganizationId(),
    ]);
    const service = createServiceCategoryCommandService(organizationId);
    await service.delete({ id }, token);
    updateTag("catalog-categories");
    return { status: "success", error: null };
  } catch (err) {
    return {
      status: "error",
      error: err instanceof Error ? err.message : "Error while deleting the category",
    };
  }
}
