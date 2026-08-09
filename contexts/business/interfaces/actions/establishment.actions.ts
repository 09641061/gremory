"use server";

import { revalidatePath } from "next/cache";
import { createEstablishmentCommandService } from "../../application/internal/commandservices/establishment-command.service";
import { createEstablishmentPhotoOutboundService } from "../../application/internal/outboundservices/establishment-photo-outbound.service";
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

function readPhotoFileFromFormData(formData: FormData) {
  const photoFile = formData.get("photoFile");
  return photoFile instanceof File && photoFile.size > 0 ? photoFile : null;
}

function readBoolFromFormData(formData: FormData, key: string) {
  return formData.get(key) === "true";
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
    const photoService = createEstablishmentPhotoOutboundService();
    const photoFile = readPhotoFileFromFormData(formData);
    const photoUrl = photoFile
      ? await photoService.upload(photoFile, token)
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
    const photoService = createEstablishmentPhotoOutboundService();
    const removePhoto = readBoolFromFormData(formData, "removePhoto");
    const currentPhotoUrl = formData.get("currentPhotoUrl");
    const photoFile = readPhotoFileFromFormData(formData);
    const photoUrl = photoFile
      ? await photoService.upload(photoFile, token)
      : removePhoto
        ? null
        : typeof currentPhotoUrl === "string" && currentPhotoUrl.trim()
          ? currentPhotoUrl
          : null;

    if (removePhoto) {
      await photoService.delete(parsed.data.id, token);
    }
    const establishmentId = await createEstablishmentCommandService(token).update(
      updateEstablishmentCommand({
        ...parsed.data,
        photoUrl,
      }),
    );
    revalidateBusinessViews(establishmentId.value);
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

function revalidateBusinessViews(establishmentId?: string) {
  revalidatePath("/catalog");
  revalidatePath("/establishments");
  if (establishmentId) {
    revalidatePath(`/establishments/${encodeURIComponent(establishmentId)}/edit`);
  }
}
