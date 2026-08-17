"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createEstablishmentCommandService } from "../../application/internal/commandservices/establishment-command.service";
import {
  createEstablishmentCommand,
  deleteEstablishmentCommand,
  updateEstablishmentCommand,
} from "../../domain/model/commands/business.commands";
import { requireBusinessAccessToken } from "../../infrastructure/session/business-session";
import {
  createEstablishmentSchema,
  deleteEstablishmentSchema,
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

/** The form posts the reference it already has under its own field name. */
function readPhotoUrlFromFormData(formData: FormData) {
  return formData.get("photoUrl") ?? formData.get("currentPhotoUrl");
}

export async function createEstablishmentAction(
  _previous: BusinessActionResult,
  formData: FormData
): Promise<BusinessActionResult> {
  const parsed = createEstablishmentSchema.safeParse({
    organizationId: formData.get("organizationId"),
    name: formData.get("name"),
    photoUrl: formData.get("photoUrl"),
    timeZone: formData.get("timeZone") ?? "America/Lima",
  });
  if (!parsed.success) return actionError(parsed.error.issues[0]?.message);

  let establishmentId = "";

  try {
    await requireBusinessAccessToken();
    const created = await createEstablishmentCommandService().create(
      createEstablishmentCommand({
        ...parsed.data,
        photoFile: readPhotoFileFromFormData(formData),
      }),
    );
    establishmentId = created.value;
    revalidateBusinessViews();
  } catch (error) {
    return actionError(error);
  }

  redirect(`/welcome?establishmentId=${encodeURIComponent(establishmentId)}`);
}

export async function updateEstablishmentAction(
  _previous: BusinessActionResult,
  formData: FormData
): Promise<BusinessActionResult> {
  const rawTimeZone = formData.get("timeZone");
  const parsed = updateEstablishmentSchema.safeParse({
    id: formData.get("id"),
    name: formData.get("name"),
    timeZone: typeof rawTimeZone === "string" && rawTimeZone.trim() ? rawTimeZone : undefined,
    photoUrl: readPhotoUrlFromFormData(formData),
    ownerAvailableForScheduling: formData.has("ownerAvailableForScheduling") ? readBoolFromFormData(formData, "ownerAvailableForScheduling") : undefined,
  });
  if (!parsed.success) return actionError(parsed.error.issues[0]?.message);

  try {
    await requireBusinessAccessToken();
    const establishmentId = await createEstablishmentCommandService().update(
      updateEstablishmentCommand({
        ...parsed.data,
        photoFile: readPhotoFileFromFormData(formData),
        removePhoto: readBoolFromFormData(formData, "removePhoto"),
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
  const parsed = deleteEstablishmentSchema.safeParse({ id: formData.get("id") });
  if (!parsed.success) return actionError(parsed.error.issues[0]?.message);

  try {
    await requireBusinessAccessToken();
    await createEstablishmentCommandService().delete(
      deleteEstablishmentCommand(parsed.data),
    );
    revalidateBusinessViews();
    return { status: "success", data: null, error: null };
  } catch (error) {
    return actionError(error);
  }
}

// Establishments are the workspace context every catalog read is scoped by, so
// the catalog is stale too once this list changes.
function revalidateBusinessViews() {
  revalidatePath("/");
  revalidatePath("/organizations");
  revalidatePath("/catalog");
  revalidatePath("/establishments");
}
