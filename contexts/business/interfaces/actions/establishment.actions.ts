"use server";

import { revalidatePath } from "next/cache";
import { apiConfig } from "@/api.config";
import { createEstablishmentCommandService } from "../../application/internal/commandservices/establishment-command.service";
import {
  createEstablishmentCommand,
  deleteEstablishmentCommand,
  updateEstablishmentCommand,
} from "../../domain/model/commands/business.commands";
import { requireBusinessAccessToken } from "../../infrastructure/session/business-session";
import {
  createEstablishmentSchema,
  updateEstablishmentSchema,
} from "../rest/schemas/establishment.schemas";
import { actionError, type BusinessActionResult } from "./business-action-result";

type EstablishmentPhotoUploadResponse = {
  message?: string;
  storedPath?: string;
  photoUrl?: string;
};

async function uploadEstablishmentPhoto(file: File, token: string): Promise<string> {
  const formData = new FormData();
  formData.set("file", file);

  const response = await fetch(`${apiConfig.baseUrl}/api/business/establishments/images`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const data = (await response.json().catch(() => null)) as EstablishmentPhotoUploadResponse | null;

  if (!response.ok) {
    throw new Error(
      (data?.message ? String(data.message) : "") ||
        "Failed to upload establishment image",
    );
  }

  if (!data?.photoUrl && !data?.storedPath) {
    throw new Error("Failed to upload establishment image");
  }

  return data.photoUrl ?? data.storedPath ?? "";
}

function readPhotoFileFromFormData(formData: FormData) {
  const photoFile = formData.get("photoFile");
  return photoFile instanceof File && photoFile.size > 0 ? photoFile : null;
}

export async function createEstablishmentAction(
  _previous: BusinessActionResult,
  formData: FormData
): Promise<BusinessActionResult> {
  const parsed = createEstablishmentSchema.safeParse({
    organizationId: formData.get("organizationId"),
    name: formData.get("name"),
    photoUrl: formData.get("photoUrl"),
  });
  if (!parsed.success) return actionError(parsed.error.issues[0]?.message);

  try {
    const token = await requireBusinessAccessToken();
    const photoFile = readPhotoFileFromFormData(formData);
    const photoUrl = photoFile
      ? await uploadEstablishmentPhoto(photoFile, token)
      : parsed.data.photoUrl ?? null;
    const establishmentId = await createEstablishmentCommandService(token).create(
      createEstablishmentCommand({
        ...parsed.data,
        photoUrl,
      }),
    );
    revalidateBusinessViews();
    return { status: "success", data: { id: establishmentId.value }, error: null };
  } catch (error) {
    return actionError(error);
  }
}

export async function updateEstablishmentAction(
  _previous: BusinessActionResult,
  formData: FormData
): Promise<BusinessActionResult> {
  const parsed = updateEstablishmentSchema.safeParse({
    id: formData.get("id"),
    name: formData.get("name"),
    photoUrl: formData.get("photoUrl"),
  });
  if (!parsed.success) return actionError(parsed.error.issues[0]?.message);

  try {
    const token = await requireBusinessAccessToken();
    const photoFile = readPhotoFileFromFormData(formData);
    const photoUrl = photoFile
      ? await uploadEstablishmentPhoto(photoFile, token)
      : parsed.data.photoUrl ?? null;
    const establishmentId = await createEstablishmentCommandService(token).update(
      updateEstablishmentCommand({
        ...parsed.data,
        photoUrl,
      }),
    );
    revalidateBusinessViews();
    return { status: "success", data: { id: establishmentId.value }, error: null };
  } catch (error) {
    return actionError(error);
  }
}

export async function deleteEstablishmentAction(
  _previous: BusinessActionResult,
  formData: FormData
): Promise<BusinessActionResult> {
  const id = formData.get("id");
  const parsed = updateEstablishmentSchema.shape.id.safeParse(id);
  if (!parsed.success) return actionError(parsed.error.issues[0]?.message);

  try {
    const token = await requireBusinessAccessToken();
    await createEstablishmentCommandService(token).delete(
      deleteEstablishmentCommand({ id: parsed.data }),
    );
    revalidateBusinessViews();
    return { status: "success", data: null, error: null };
  } catch (error) {
    return actionError(error);
  }
}

function revalidateBusinessViews() {
  revalidatePath("/catalog");
  revalidatePath("/establishments");
}
