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

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
]);

async function readImageFile(formData: FormData): Promise<ProfileImageInput | null> {
  const imageFile = formData.get("imageFile");
  if (!(imageFile instanceof File) || imageFile.size <= 0) return null;
  if (imageFile.size > MAX_IMAGE_BYTES) {
    throw new z.ZodError([
      {
        code: "custom",
        path: ["imageFile"],
        message: "Image must be 8 MB or smaller",
      },
    ]);
  }
  if (imageFile.type && !ALLOWED_IMAGE_TYPES.has(imageFile.type)) {
    throw new z.ZodError([
      {
        code: "custom",
        path: ["imageFile"],
        message: "Unsupported image format",
      },
    ]);
  }
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
