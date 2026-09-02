"use server";

import "server-only";
import { cookies } from "next/headers";
import { updateTag } from "next/cache";
import { iamSessionCookies } from "@/contexts/iam/infrastructure/session/iam-session-cookie";
import { updateProfileSchema } from "../rest/schemas/profile.schemas";
import { createUsername } from "../../domain/model/valueobjects/username";
import { createProfileImageUrl } from "../../domain/model/valueobjects/profile-image-url";
import { createProfileCommandService } from "../../application/factory";
import type { ProfileViewModel } from "../../application/services/profile.view-model";

function readImageFile(formData: FormData) {
  const imageFile = formData.get("imageFile");
  return imageFile instanceof File && imageFile.size > 0 ? imageFile : null;
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
      imageFile: readImageFile(formData),
    };

    const service = createProfileCommandService();
    const profile = await service.updateProfile(command, accessToken);

    updateTag("profile");

    return {
      status: "success",
      data: profile,
      error: null,
    };
  } catch (error) {
    return {
      status: "error",
      data: null,
      error: error instanceof Error ? error.message : "Failed to update profile",
    };
  }
}
