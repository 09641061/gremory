"use server";

import { safePublicError } from "@/contexts/shared/interfaces/actions/safe-error";


import "server-only";
import { cookies } from "next/headers";
import { revalidatePath, updateTag } from "next/cache";
import { z } from "zod";
import { iamSessionCookies } from "@/contexts/iam/infrastructure/session/iam-session-cookie";
import { updateProfileSchema } from "../rest/schemas/profile.schemas";
import { createUsername } from "../../domain/model/valueobjects/username";
import { createProfileImageUrl } from "../../domain/model/valueobjects/profile-image-url";
import { createProfileCommandService } from "../../application/factory";
import type { ProfileViewModel } from "../../application/services/profile.view-model";

async function readImageFile(formData: FormData) {
  const imageFile = formData.get("imageFile");
  if (!(imageFile instanceof File) || imageFile.size <= 0) return null;
  return {
    name: imageFile.name,
    type: imageFile.type,
    size: imageFile.size,
    bytes: new Uint8Array(await imageFile.arrayBuffer()),
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

    const service = createProfileCommandService();
    const profile = await service.updateProfile(command, accessToken);

    try {
      updateTag("profile");
      revalidatePath("/team");
      revalidatePath("/profile");
      revalidatePath("/", "layout");
    } catch {
      // The backend write is already confirmed; invalidation is best effort.
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
