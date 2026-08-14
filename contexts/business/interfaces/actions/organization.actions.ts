"use server";

import { revalidatePath } from "next/cache";
import { createOrganizationCommandService } from "../../application/internal/commandservices/organization-command.service";
import { updateOrganizationCommand } from "../../domain/model/commands/business.commands";
import { requireBusinessAccessToken } from "../../infrastructure/session/business-session";
import { updateOrganizationSchema } from "../rest/schemas/organization.schemas";
import {
  actionError,
  type BusinessActionResult,
} from "./business-action-result";

function readPhotoFileFromFormData(formData: FormData) {
  const photoFile = formData.get("photoFile");
  return photoFile instanceof File && photoFile.size > 0 ? photoFile : null;
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
