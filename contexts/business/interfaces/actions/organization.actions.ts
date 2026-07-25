"use server";

import { revalidatePath } from "next/cache";
import { createOrganizationCommandService } from "../../application/internal/commandservices/organization-command.service";
import {
  createOrganizationCommand,
  deleteOrganizationCommand,
  updateOrganizationCommand,
} from "../../domain/model/commands/business.commands";
import { requireBusinessAccessToken } from "../../infrastructure/session/business-session";
import { createOrganizationSchema, updateOrganizationSchema } from "../rest/schemas/organization.schemas";
import {
  actionError,
  type BusinessActionResult,
} from "./business-action-result";

export async function createOrganizationAction(
  _previous: BusinessActionResult,
  formData: FormData
): Promise<BusinessActionResult> {
  const parsed = createOrganizationSchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) return actionError(parsed.error.issues[0]?.message);

  try {
    const token = await requireBusinessAccessToken();
    const organizationId = await createOrganizationCommandService(token).create(
      createOrganizationCommand(parsed.data),
    );
    revalidateBusinessViews();
    return { status: "success", data: { id: organizationId.value }, error: null };
  } catch (error) {
    return actionError(error);
  }
}

export async function updateOrganizationAction(
  _previous: BusinessActionResult,
  formData: FormData
): Promise<BusinessActionResult> {
  const parsed = updateOrganizationSchema.safeParse({
    id: formData.get("id"),
    name: formData.get("name"),
  });
  if (!parsed.success) return actionError(parsed.error.issues[0]?.message);

  try {
    const token = await requireBusinessAccessToken();
    const organizationId = await createOrganizationCommandService(token).update(
      updateOrganizationCommand(parsed.data),
    );
    revalidateBusinessViews();
    return { status: "success", data: { id: organizationId.value }, error: null };
  } catch (error) {
    return actionError(error);
  }
}

export async function deleteOrganizationAction(
  _previous: BusinessActionResult,
  formData: FormData
): Promise<BusinessActionResult> {
  const id = formData.get("id");
  const parsed = updateOrganizationSchema.shape.id.safeParse(id);
  if (!parsed.success) return actionError(parsed.error.issues[0]?.message);

  try {
    const token = await requireBusinessAccessToken();
    await createOrganizationCommandService(token).delete(
      deleteOrganizationCommand({ id: parsed.data }),
    );
    revalidateBusinessViews();
    return { status: "success", data: null, error: null };
  } catch (error) {
    return actionError(error);
  }
}

function revalidateBusinessViews() {
  revalidatePath("/catalog");
  revalidatePath("/organizations");
  revalidatePath("/establishments");
}
