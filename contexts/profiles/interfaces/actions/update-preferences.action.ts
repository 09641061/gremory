"use server";

import "server-only";
import { cookies } from "next/headers";
import { updateTag } from "next/cache";
import { z } from "zod";
import { iamSessionCookies } from "@/contexts/iam/infrastructure/session/iam-session-cookie";
import { updatePreferencesSchema } from "../rest/schemas/profile.schemas";
import { createLanguage } from "../../domain/model/valueobjects/language";
import { createTheme } from "../../domain/model/valueobjects/theme";
import { createProfilePreferences } from "../../domain/model/valueobjects/profile-preferences";
import { createProfileCommandService } from "../../application/factory";
import type { ProfileViewModel } from "../../application/services/profile.view-model";
import {
  LOCALE_COOKIE_NAME,
  LOCALE_COOKIE_OPTIONS,
} from "@/contexts/shared/infrastructure/i18n/i18n-cookie";

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

    if (typeof cookieStore.set === "function") {
      cookieStore.set(LOCALE_COOKIE_NAME, input.language.toLowerCase(), LOCALE_COOKIE_OPTIONS);
    }

    updateTag("profile");

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
        error: error.issues[0]?.message ?? "Invalid preferences data",
      };
    }

    return {
      status: "error",
      data: null,
      error: error instanceof Error ? error.message : "Failed to update preferences",
    };
  }
}
