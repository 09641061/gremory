"use server";

import { cookies } from "next/headers";
import { revalidateTag } from "next/cache";
import { iamSessionCookies } from "@/contexts/iam/infrastructure/session/iam-session-cookie";
import { updatePreferencesSchema } from "../rest/schemas/profile.schemas";
import { createLanguage } from "../../domain/model/valueobjects/language";
import { createTheme } from "../../domain/model/valueobjects/theme";
import { createProfilePreferences } from "../../domain/model/valueobjects/profile-preferences";
import { createProfileCommandService } from "../../application/factory";
import type { ProfileViewModel } from "../../application/services/profile.view-model";

export type UpdatePreferencesActionState =
  | { status: "idle"; data: null; error: null }
  | { status: "success"; data: ProfileViewModel; error: null }
  | { status: "error"; data: null; error: string };

export async function updatePreferencesAction(
  _previousState: UpdatePreferencesActionState,
  formData: FormData
): Promise<UpdatePreferencesActionState> {
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
    const input = updatePreferencesSchema.parse({
      language: formData.get("language"),
      theme: formData.get("theme"),
    });

    const command = {
      preferences: createProfilePreferences(
        createLanguage(input.language),
        createTheme(input.theme)
      ),
    };

    const service = createProfileCommandService();
    const profile = await service.updatePreferences(command, accessToken);

    revalidateTag("profile", "");

    return {
      status: "success",
      data: profile,
      error: null,
    };
  } catch (error) {
    return {
      status: "error",
      data: null,
      error: error instanceof Error ? error.message : "Failed to update preferences",
    };
  }
}
