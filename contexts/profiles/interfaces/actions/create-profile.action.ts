"use server";

import "server-only";
import { cookies } from "next/headers";
import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { iamSessionCookies } from "@/contexts/iam/infrastructure/session/iam-session-cookie";
import { safePublicError } from "@/contexts/shared/interfaces/actions/safe-error";
import { createProfileImageUrl } from "../../domain/model/valueobjects/profile-image-url";
import { createUsername } from "../../domain/model/valueobjects/username";
import { createProfileSchema } from "../rest/schemas/profile.schemas";
import { composeProfileAdapters } from "../server/profile-composition";

export type CreateProfileActionState =
  | { status: "idle"; error: null }
  | { status: "error"; error: string };

export async function createProfileAction(
  _previousState: CreateProfileActionState,
  formData: FormData,
): Promise<CreateProfileActionState> {
  const accessToken = (await cookies()).get(iamSessionCookies.accessToken)?.value;
  if (!accessToken) {
    return { status: "error", error: "Authentication required" };
  }

  try {
    const input = createProfileSchema.parse({
      username: formData.get("username"),
      imageUrl: null,
    });
    await composeProfileAdapters().commandService.createProfile(
      {
        username: createUsername(input.username),
        imageUrl: createProfileImageUrl(input.imageUrl),
      },
      accessToken,
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        status: "error",
        error: error.issues[0]?.message ?? "Invalid profile data",
      };
    }
    return {
      status: "error",
      error: safePublicError(error, "Failed to create profile").message,
    };
  }

  try {
    updateTag("profile");
    revalidatePath("/", "layout");
  } catch {
    // The backend-confirmed creation remains successful if invalidation fails.
  }

  redirect("/");
}
