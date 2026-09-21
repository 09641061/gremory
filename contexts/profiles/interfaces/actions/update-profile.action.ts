"use server";

import "server-only";
import { cookies } from "next/headers";
import { revalidatePath, updateTag } from "next/cache";
import { z } from "zod";

import { safePublicError } from "@/contexts/shared/interfaces/actions/safe-error";
import { iamSessionCookies } from "@/contexts/iam/infrastructure/session/iam-session-cookie";
import { updateProfileSchema } from "../rest/schemas/profile.schemas";
import { createUsername } from "../../domain/model/valueobjects/username";
import { createProfileImageUrl } from "../../domain/model/valueobjects/profile-image-url";
import type { ProfileImageInput } from "../../domain/model/commands/update-profile.command";
import { composeProfileAdapters } from "../server/profile-composition";
import type { ProfileViewModel } from "../../application/services/profile.view-model";

async function readImageFile(formData: FormData): Promise<ProfileImageInput | null> {
  const imageFile = formData.get("imageFile");
  if (!(imageFile instanceof File) || imageFile.size <= 0) return null;
  // The backend owns accepted MIME types and size limits. Keep this boundary
  // transport-neutral and avoid duplicating undocumented constraints here.
  const bytes = new Uint8Array(await imageFile.arrayBuffer());
  return {
    name: imageFile.name,
    type: imageFile.type,
    size: imageFile.size,
    bytes,
  };
}

export type UpdateProfileActionState =
  | { status: "idle"; data: null; error: null }
  | { status: "success"; data: ProfileViewModel; error: null }
  | { status: "error"; data: null; error: string };

export async function updateProfileAction(
  _previousState: UpdateProfileActionState,
  formData: FormData
): Promise<UpdateProfileActionState> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(iamSessionCookies.accessToken)?.value;

  if (!accessToken) {
    return {
      status: "error",
      data: null,
      error: "Authentication required",
    };
  }

  try {
    const input = updateProfileSchema.parse({
      username: formData.get("username"),
      imageUrl: formData.get("currentImageUrl") || null,
    });

    const command = {
      username: createUsername(input.username),
      imageUrl: createProfileImageUrl(input.imageUrl),
      imageFile: await readImageFile(formData),
    };

    const profile = await composeProfileAdapters().commandService.updateProfile(
      command,
      accessToken,
    );

    // Invalidation is best effort: a backend-confirmed write must not be
    // turned into an error by a failed cache update.
    try {
      updateTag("profile");
      revalidatePath("/team");
      revalidatePath("/profile");
      revalidatePath("/", "layout");
    } catch {
      /* swallow */
    }

    return {
      status: "success",
      data: profile,
      error: null,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        status: "error",
        data: null,
        error: error.issues[0]?.message ?? "Invalid profile data",
      };
    }

    return {
      status: "error",
      data: null,
      error: safePublicError(error, "Failed to update profile").message,
    };
  }
}
