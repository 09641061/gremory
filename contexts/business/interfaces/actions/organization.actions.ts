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


async function updateOrganizationWithMultipart(
  organizationId: string,
  name: string,
  photoFile: File | null,
  currentPhotoUrl: string | null,
  token: string,
) {
  const formData = new FormData();
  formData.set("name", name);
  if (photoFile) {
    formData.set("photoFile", photoFile);
  } else if (currentPhotoUrl) {
    formData.set("imageUrl", currentPhotoUrl);
  }

  const response = await fetch(
    `${apiConfig.baseUrl}${apiConfig.routes.organizations}/${encodeURIComponent(organizationId)}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    },
  );

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.message || "Failed to update organization");
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

    if (photoFile) {
      await updateOrganizationWithMultipart(
        id,
        name,
        photoFile,
        typeof currentPhotoUrl === "string" ? currentPhotoUrl : null,
        token,
      );
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
