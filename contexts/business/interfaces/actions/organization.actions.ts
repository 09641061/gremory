"use server";

import { revalidatePath } from "next/cache";
import { createOrganizationCommandService } from "../../application/internal/commandservices/organization-command.service";
import { createOrganizationImageUploadService } from "../../application/internal/outboundservices/organization-image-upload.service";
import {
  createOrganizationCommand,
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
  formData: FormData,
): Promise<BusinessActionResult> {
  const parsed = createOrganizationSchema.safeParse({
    name: formData.get("name"),
  });
  if (!parsed.success) return actionError(parsed.error.issues[0]?.message);

  try {
    const token = await requireBusinessAccessToken();
    const imageUploadService = createOrganizationImageUploadService();
    const photoFile = readPhotoFileFromFormData(formData);
    const organizationId = await createOrganizationCommandService(token).create(
      createOrganizationCommand(parsed.data),
    );

    if (photoFile) {
      await imageUploadService.upload(organizationId.value, parsed.data.name, photoFile, token);
    }

    revalidateBusinessViews();
    return { status: "success", data: { id: organizationId.value }, error: null };
  } catch (error) {
    return actionError(error);
  }
}

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
    const imageUploadService = createOrganizationImageUploadService();

    if (photoFile) {
      await imageUploadService.upload(id, name, photoFile, token);
    } else {
      const parsed = updateOrganizationSchema.safeParse({
        id,
        name,
        imageUrl: typeof currentPhotoUrl === "string" && currentPhotoUrl.trim() ? currentPhotoUrl : null,
      });
      if (!parsed.success) return actionError(parsed.error.issues[0]?.message);

      await createOrganizationCommandService(token).update(
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
  revalidatePath("/organizations");
  revalidatePath("/establishments");
}
