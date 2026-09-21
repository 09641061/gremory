import "server-only";

import { apiConfig } from "@/api.config";
import { ApiError, apiClient } from "@/contexts/shared/infrastructure/http/api-client";
import type { ProfileImageInput } from "../../domain/model/commands/update-profile.command";
import type { UpdateProfileCommand } from "../../domain/model/commands/update-profile.command";
import type { UpdateProfilePreferencesCommand } from "../../domain/model/commands/update-profile-preferences.command";
import { profileFromApiResponse } from "../../interfaces/rest/mappers/profile.mapper";
import type { ProfileViewModel } from "../../application/services/profile.view-model";
import type { ProfileReader } from "../../application/ports/profile-reader";
import type { ProfileWriter } from "../../application/ports/profile-writer";

export class ProfileApiError extends ApiError {
  constructor(message: string, status: number, details?: unknown) {
    super(message, status, details);
    this.name = "ProfileApiError";
  }
}

/**
 * Concrete ProfileReader + ProfileWriter. The class is the only place where
 * the backend profile API is contacted; Application receives the port via
 * `composeProfileAdapters()`.
 */
export class HttpProfileRepository implements ProfileReader, ProfileWriter {
  async getMyProfile(token: string): Promise<ProfileViewModel | null> {
    try {
      const response = await apiClient.get<unknown>(apiConfig.routes.profiles.root, {
        token,
        errorMessage: "Failed to retrieve user profile",
        errorType: ProfileApiError,
      });

      return profileFromApiResponse(response);
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        return null;
      }
      throw error;
    }
  }

  async updateProfile(
    command: UpdateProfileCommand,
    token: string,
  ): Promise<ProfileViewModel> {
    const response = command.imageFile
      ? await this.updateWithImage(command, token)
      : await apiClient.put<unknown>(
          apiConfig.routes.profiles.root,
          { username: command.username.value, imageUrl: command.imageUrl.value },
          {
            token,
            errorMessage: "Failed to update profile",
            errorType: ProfileApiError,
          },
        );

    return profileFromApiResponse(response);
  }

  private async updateWithImage(command: UpdateProfileCommand, token: string) {
    const formData = new FormData();
    const imageFile = command.imageFile;
    if (!imageFile) throw new ProfileApiError("Invalid profile image", 400);
    formData.set("username", command.username.value);
    // ProfileImageInput is transport-neutral; rebuild a Blob so FormData can
    // stream it. The original filename and MIME are preserved.
    const blob = new Blob([imageFile.bytes.buffer as ArrayBuffer], { type: imageFile.type });
    formData.set("photoFile", blob, imageFile.name);
    if (command.imageUrl?.value) {
      formData.set("imageUrl", command.imageUrl.value);
    }

    return apiClient.requestMultipart<unknown>(apiConfig.routes.profiles.root, formData, {
      method: "PUT",
      token,
      errorMessage: "Failed to update profile",
      errorType: ProfileApiError,
    });
  }

  async updatePreferences(
    command: UpdateProfilePreferencesCommand,
    token: string,
  ): Promise<ProfileViewModel> {
    const payload = {
      language: command.preferences.language,
      theme: command.preferences.theme,
    };

    const response = await apiClient.put<unknown>(
      apiConfig.routes.profiles.preferences,
      payload,
      {
        token,
        errorMessage: "Failed to update preferences",
        errorType: ProfileApiError,
      },
    );

    return profileFromApiResponse(response);
  }
}

export type { ProfileImageInput };
