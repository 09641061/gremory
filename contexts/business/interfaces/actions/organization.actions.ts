"use server";

import { revalidatePath } from "next/cache";
import { apiConfig } from "@/api.config";
import { createOrganizationCommandService } from "../../application/internal/commandservices/organization-command.service";
import {
  updateOrganizationCommand,
} from "../../domain/model/commands/business.commands";
import { requireBusinessAccessToken } from "../../infrastructure/session/business-session";
import { updateOrganizationSchema } from "../rest/schemas/organization.schemas";
import {
  actionError,
  type BusinessActionResult,
} from "./business-action-result";

type PhotoUploadResponse = {
  message?: string;
  storedPath?: string;
  photoUrl?: string;
};

async function uploadOrganizationPhoto(file: File, token: string): Promise<string> {
  const formData = new FormData();
  formData.set("file", file);

  const response = await fetch(`${apiConfig.baseUrl}${apiConfig.routes.organizationImages}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const data = (await response.json().catch(() => null)) as PhotoUploadResponse | null;

  if (!response.ok) {
    throw new Error(
      (data?.message ? String(data.message) : "") ||
        "Failed to upload organization image",
    );
  }

  if (!data?.photoUrl && !data?.storedPath) {
    throw new Error("Failed to upload organization image");
  }

  return data.photoUrl ?? data.storedPath ?? "";
}

function readPhotoFileFromFormData(formData: FormData) {
  const photoFile = formData.get("photoFile");
  return photoFile instanceof File && photoFile.size > 0 ? photoFile : null;
}

export async function updateOrganizationAction(
  _previous: BusinessActionResult,
  formData: FormData
): Promise<BusinessActionResult> {
  const removePhoto = formData.get("removePhoto") === "true";
  const currentPhotoUrl = formData.get("currentPhotoUrl");
  const photoFile = readPhotoFileFromFormData(formData);

  try {
    const token = await requireBusinessAccessToken();
    const imageUrl = photoFile
      ? await uploadOrganizationPhoto(photoFile, token)
      : removePhoto
        ? null
        : typeof currentPhotoUrl === "string" && currentPhotoUrl.trim()
          ? currentPhotoUrl
          : null;

    const parsed = updateOrganizationSchema.safeParse({
      id: formData.get("id"),
      name: formData.get("name"),
      imageUrl,
    });
    if (!parsed.success) return actionError(parsed.error.issues[0]?.message);

    const organizationId = await createOrganizationCommandService(token).update(
      updateOrganizationCommand(parsed.data),
    );
    revalidateBusinessViews();
    return { status: "success", data: { id: organizationId.value }, error: null };
  } catch (error) {
    return actionError(error);
  }
}

function revalidateBusinessViews() {
  revalidatePath("/catalog");
  revalidatePath("/organizations");
  revalidatePath("/establishments");
}
