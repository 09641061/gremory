"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { createOrganizationCommandService } from "../../application/internal/commandservices/organization-command.service";
import {
  createOrganizationCommand,
  updateOrganizationCommand,
} from "../../domain/model/commands/business.commands";
import { requireBusinessAccessToken } from "../../infrastructure/session/business-session";
import { workspaceSelectionCookies } from "../../infrastructure/session/workspace-selection-cookie";
import { createOrganizationSchema, updateOrganizationSchema } from "../rest/schemas/organization.schemas";
import {
  actionError,
  type BusinessActionResult,
} from "./business-action-result";

function readPhotoFileFromFormData(formData: FormData) {
  const photoFile = formData.get("photoFile");
  return photoFile instanceof File && photoFile.size > 0 ? photoFile : null;
}

/** Onboarding step 1 (owner) and the member-starts-their-own-business path. */
export async function createOrganizationAction(
  _previous: BusinessActionResult,
  formData: FormData
): Promise<BusinessActionResult> {
  const parsed = createOrganizationSchema.safeParse({
    name: formData.get("name"),
  });
  if (!parsed.success) return actionError(parsed.error.issues[0]?.message);

  try {
    await requireBusinessAccessToken();
    const organizationId = await createOrganizationCommandService().create(
      createOrganizationCommand({
        ...parsed.data,
        imageFile: readPhotoFileFromFormData(formData),
      }),
    );
    // Creating an organization starts a new tenant context. Any previously
    // selected establishment may belong to another account or organization.
    (await cookies()).delete(workspaceSelectionCookies.establishmentId);
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
  const currentPhotoUrl = formData.get("currentPhotoUrl");
  const parsed = updateOrganizationSchema.safeParse({
    id: formData.get("id"),
    name: formData.get("name"),
    imageUrl:
      typeof currentPhotoUrl === "string" && currentPhotoUrl.trim() ? currentPhotoUrl : null,
  });
  if (!parsed.success) return actionError(parsed.error.issues[0]?.message);

  try {
    await requireBusinessAccessToken();
    const organizationId = await createOrganizationCommandService().update(
      updateOrganizationCommand({
        ...parsed.data,
        imageFile: readPhotoFileFromFormData(formData),
      }),
    );
    revalidateBusinessViews();
    return { status: "success", data: { id: organizationId.value }, error: null };
  } catch (error) {
    return actionError(error);
  }
}

function revalidateBusinessViews() {
  revalidatePath("/catalog");
  revalidatePath("/organization");
  revalidatePath("/establishments");
}
