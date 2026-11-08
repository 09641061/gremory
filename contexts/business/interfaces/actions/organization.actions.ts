"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
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
import { requireOrganizationCapability } from "@/contexts/business/interfaces/authorization/business-authorization";
import { composeBusinessAdapters } from "../server/business-composition";

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
    const adapters = composeBusinessAdapters();
    await adapters.organizationCommandService.create(
      createOrganizationCommand({
        ...parsed.data,
        imageFile: await readPhotoFileFromFormData(formData),
      }),
    );
    await clearWorkspaceSelection();
    revalidateBusinessViews();
  } catch (error) {
    return actionError(error);
  }

  // Let the entry-route resolver decide whether the generated first
  // establishment still needs setup. This avoids sending every owner to the
  // establishment form when organization creation already created it.
  redirect("/");
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
    await requireOrganizationCapability(parsed.data.id, "canUpdate");
    const adapters = composeBusinessAdapters();
    const organizationId = await adapters.organizationCommandService.update(
      updateOrganizationCommand({
        ...parsed.data,
        imageFile: await readPhotoFileFromFormData(formData),
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
  revalidatePath("/configuration/organization");
  revalidatePath("/configuration/establishments");
}

async function clearWorkspaceSelection() {
  const cookieStore = await cookies();
  cookieStore.delete(workspaceSelectionCookies.establishmentId);
}
