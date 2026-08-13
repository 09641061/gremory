"use server";

import { revalidatePath } from "next/cache";
import { createOrganizationCommandService } from "../../application/internal/commandservices/organization-command.service";
import { createOrganizationImageUploadAdapter } from "@/contexts/business/infrastructure/adapters/organization-image-upload.adapter";
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
  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "");
  const currentPhotoUrl = formData.get("currentPhotoUrl");
  const photoFile = readPhotoFileFromFormData(formData);

  try {
    const token = await requireBusinessAccessToken();
    const imageUploadService = createOrganizationImageUploadAdapter();

    if (photoFile) {
      await imageUploadService.upload(id, name, photoFile, token);
      } else {
        const parsed = updateOrganizationSchema.safeParse({
          id,
          name,
          imageUrl: typeof currentPhotoUrl === "string" && currentPhotoUrl.trim() ? currentPhotoUrl : null,
        });
      if (!parsed.success) return actionError(parsed.error.issues[0]?.message);

      await createOrganizationCommandService().update(
        updateOrganizationCommand(parsed.data),
      );
    }

    revalidateBusinessViews();
    return { status: "success", data: { id }, error: null };
  } catch (error) {
    return actionError(error);
  }
}

function revalidateBusinessViews() {
  revalidatePath("/catalog");
  revalidatePath("/organization");
  revalidatePath("/establishments");
}
