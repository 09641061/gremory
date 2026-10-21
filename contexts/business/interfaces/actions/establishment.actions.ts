"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
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
  connectWhatsappSchema,
  disconnectWhatsappSchema,
  type WhatsappStatusResponse,
} from "../rest/schemas/establishment.schemas";
import { actionError, type BusinessActionResult } from "./business-action-result";
import type { ActionResult } from "@/contexts/shared/interfaces/actions/action-result";
import { actionResultError } from "@/contexts/shared/interfaces/actions/action-result";
import { requireEstablishmentCapability } from "@/contexts/business/interfaces/authorization/business-authorization";
import { composeBusinessAdapters } from "../server/business-composition";
import { createEstablishmentId } from "../../domain/model/valueobjects/establishment-id.vo";
import { createOrganizationId } from "../../domain/model/valueobjects/organization-id.vo";
import { EstablishmentApiGateway } from "../../infrastructure/gateways/establishment-api.gateway";

async function readPhotoFileFromFormData(formData: FormData) {
  const photoFile = formData.get("photoFile");
  if (!(photoFile instanceof File) || photoFile.size <= 0) return null;
  return {
    name: photoFile.name,
    type: photoFile.type,
    size: photoFile.size,
    bytes: new Uint8Array(await photoFile.arrayBuffer()),
  };
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
  const rawCurrency = formData.get("currency");
  const parsed = createEstablishmentSchema.safeParse({
    organizationId: formData.get("organizationId"),
    name: formData.get("name"),
    photoUrl: formData.get("photoUrl"),
    timeZone: formData.get("timeZone") ?? "America/Lima",
    currency: typeof rawCurrency === "string" && rawCurrency.trim() ? rawCurrency : "USD",
  });
  if (!parsed.success) return actionError(parsed.error.issues[0]?.message);

  let establishmentId = "";

  try {
    await requireBusinessAccessToken();
    const adapters = composeBusinessAdapters();
    const created = await adapters.establishmentCommandService.create(
      createEstablishmentCommand({
        ...parsed.data,
        photoFile: await readPhotoFileFromFormData(formData),
      }),
    );
    establishmentId = created.value;
    revalidateBusinessViews();
  } catch (error) {
    return actionError(error);
  }

  redirect(`/?establishmentId=${encodeURIComponent(establishmentId)}`);
}

export async function updateEstablishmentAction(
  _previous: BusinessActionResult,
  formData: FormData
): Promise<BusinessActionResult> {
  const rawTimeZone = formData.get("timeZone");
  const rawCurrency = formData.get("currency");
  const parsed = updateEstablishmentSchema.safeParse({
    id: formData.get("id"),
    name: formData.get("name"),
    timeZone: typeof rawTimeZone === "string" && rawTimeZone.trim() ? rawTimeZone : undefined,
    currency: typeof rawCurrency === "string" && rawCurrency.trim() ? rawCurrency : undefined,
    photoUrl: readPhotoUrlFromFormData(formData),
    ownerAvailableForScheduling: formData.has("ownerAvailableForScheduling") ? readBoolFromFormData(formData, "ownerAvailableForScheduling") : undefined,
  });
  if (!parsed.success) return actionError(parsed.error.issues[0]?.message);

  try {
    await requireEstablishmentCapability(parsed.data.id, "canUpdate");
    const adapters = composeBusinessAdapters();
    const establishmentId = await adapters.establishmentCommandService.update(
      updateEstablishmentCommand({
        ...parsed.data,
        photoFile: await readPhotoFileFromFormData(formData),
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
    await requireEstablishmentCapability(parsed.data.id, "canDelete");
    const adapters = composeBusinessAdapters();
    await adapters.establishmentCommandService.delete(
      deleteEstablishmentCommand(parsed.data),
    );
    revalidateBusinessViews();
    return { status: "success", data: null, error: null };
  } catch (error) {
    return actionError(error);
  }
}

export type WhatsappActionResult = ActionResult<WhatsappStatusResponse | null>;

export async function getEstablishmentWhatsappStatusAction(
  establishmentId: string
): Promise<WhatsappActionResult> {
  try {
    const { token, organizationId } = await requireEstablishmentCapability(establishmentId, "canRead");
    const gateway = new EstablishmentApiGateway(token);
    const status = await gateway.getWhatsappStatus(
      createEstablishmentId(establishmentId),
      organizationId ? createOrganizationId(organizationId) : undefined
    );
    return { status: "success", data: status, error: null };
  } catch (error) {
    return actionResultError<WhatsappStatusResponse | null>(error);
  }
}

export async function connectEstablishmentWhatsappAction(
  establishmentId: string,
  code: string,
  wabaId?: string | null,
  phoneNumberId?: string | null,
): Promise<WhatsappActionResult> {
  const parsed = connectWhatsappSchema.safeParse({
    establishmentId,
    code,
    wabaId,
    phoneNumberId,
  });
  if (!parsed.success) return actionResultError<WhatsappStatusResponse | null>(parsed.error.issues[0]?.message);

  try {
    const { token, organizationId } = await requireEstablishmentCapability(establishmentId, "canUpdate");
    const gateway = new EstablishmentApiGateway(token);
    const status = await gateway.connectWhatsapp(
      createEstablishmentId(parsed.data.establishmentId),
      parsed.data.code,
      organizationId ? createOrganizationId(organizationId) : undefined,
      parsed.data.wabaId,
      parsed.data.phoneNumberId,
    );
    revalidateBusinessViews();
    return { status: "success", data: status, error: null };
  } catch (error) {
    return actionResultError<WhatsappStatusResponse | null>(error);
  }
}

export async function disconnectEstablishmentWhatsappAction(
  establishmentId: string
): Promise<BusinessActionResult> {
  const parsed = disconnectWhatsappSchema.safeParse({ establishmentId });
  if (!parsed.success) return actionError(parsed.error.issues[0]?.message);

  try {
    const { token, organizationId } = await requireEstablishmentCapability(establishmentId, "canUpdate");
    const gateway = new EstablishmentApiGateway(token);
    await gateway.disconnectWhatsapp(
      createEstablishmentId(parsed.data.establishmentId),
      organizationId ? createOrganizationId(organizationId) : undefined
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
  revalidatePath("/organization");
  revalidatePath("/catalog");
  revalidatePath("/configuration/establishments");
}
