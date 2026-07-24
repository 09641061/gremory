"use server";

import { revalidatePath } from "next/cache";
import { createEstablishmentSchema, updateEstablishmentSchema } from "../rest/schemas/establishment.schemas";
import { createEstablishmentCommandService } from "../../application/internal/commandservices/establishment-command.service";

export type EstablishmentActionResult = {
  status: "idle" | "success" | "error";
  data?: { id?: string };
  error: string | null;
};

export async function createEstablishmentAction(
  _prevState: EstablishmentActionResult,
  formData: FormData
): Promise<EstablishmentActionResult> {
  const rawData = {
    organizationId: formData.get("organizationId"),
    name: formData.get("name"),
    photoUrl: formData.get("photoUrl") || undefined,
  };

  const parsed = createEstablishmentSchema.safeParse(rawData);

  if (!parsed.success) {
    return { status: "error", error: parsed.error.issues[0]?.message ?? "Invalid data" };
  }

  try {
    const service = createEstablishmentCommandService();
    const result = await service.create({
      ...parsed.data,
      photoUrl: parsed.data.photoUrl || null,
    });
    revalidatePath("/chat");
    return { status: "success", data: { id: result.props.id.value }, error: null };
  } catch (err) {
    return {
      status: "error",
      error: err instanceof Error ? err.message : "Failed to create establishment",
    };
  }
}

export async function updateEstablishmentAction(
  _prevState: EstablishmentActionResult,
  formData: FormData
): Promise<EstablishmentActionResult> {
  const rawData = {
    id: formData.get("id"),
    name: formData.get("name"),
    photoUrl: formData.get("photoUrl") || undefined,
  };

  const parsed = updateEstablishmentSchema.safeParse(rawData);

  if (!parsed.success) {
    return { status: "error", error: parsed.error.issues[0]?.message ?? "Invalid data" };
  }

  try {
    const service = createEstablishmentCommandService();
    await service.update({
      ...parsed.data,
      photoUrl: parsed.data.photoUrl || null,
    });
    revalidatePath("/chat");
    return { status: "success", error: null };
  } catch (err) {
    return {
      status: "error",
      error: err instanceof Error ? err.message : "Failed to update establishment",
    };
  }
}

export async function deleteEstablishmentAction(id: string): Promise<EstablishmentActionResult> {
  try {
    const service = createEstablishmentCommandService();
    await service.delete({ id });
    revalidatePath("/chat");
    return { status: "success", error: null };
  } catch (err) {
    return {
      status: "error",
      error: err instanceof Error ? err.message : "Failed to delete establishment",
    };
  }
}
