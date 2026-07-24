"use server";

import { revalidatePath } from "next/cache";
import { createOrganizationSchema, updateOrganizationSchema } from "../rest/schemas/organization.schemas";
import { createOrganizationCommandService } from "../../application/internal/commandservices/organization-command.service";

export type OrganizationActionResult = {
  status: "idle" | "success" | "error";
  data?: { id?: string };
  error: string | null;
};

export async function createOrganizationAction(
  _prevState: OrganizationActionResult,
  formData: FormData
): Promise<OrganizationActionResult> {
  const rawData = { name: formData.get("name") };
  const parsed = createOrganizationSchema.safeParse(rawData);

  if (!parsed.success) {
    return { status: "error", error: parsed.error.issues[0]?.message ?? "Invalid data" };
  }

  try {
    const service = createOrganizationCommandService();
    const result = await service.create(parsed.data);
    revalidatePath("/chat");
    return { status: "success", data: { id: result.props.id.value }, error: null };
  } catch (err) {
    return {
      status: "error",
      error: err instanceof Error ? err.message : "Failed to create organization",
    };
  }
}

export async function updateOrganizationAction(
  _prevState: OrganizationActionResult,
  formData: FormData
): Promise<OrganizationActionResult> {
  const rawData = { id: formData.get("id"), name: formData.get("name") };
  const parsed = updateOrganizationSchema.safeParse(rawData);

  if (!parsed.success) {
    return { status: "error", error: parsed.error.issues[0]?.message ?? "Invalid data" };
  }

  try {
    const service = createOrganizationCommandService();
    await service.update(parsed.data);
    revalidatePath("/chat");
    return { status: "success", error: null };
  } catch (err) {
    return {
      status: "error",
      error: err instanceof Error ? err.message : "Failed to update organization",
    };
  }
}
