import "server-only";

import { apiConfig } from "@/api.config";
import { ApiError, apiClient } from "@/contexts/shared/infrastructure/http/api-client";
import type { ProfileRepository } from "../../domain/repositories/profile.repository";
import type { UpdateProfileCommand } from "../../domain/model/commands/update-profile.command";
import type { UpdateProfilePreferencesCommand } from "../../domain/model/commands/update-profile-preferences.command";
import { profileFromApiResponse } from "../../interfaces/rest/mappers/profile.mapper";
import type { ProfileViewModel } from "../../application/services/profile.view-model";

export class ProfileApiError extends ApiError {
  constructor(message: string, status: number, details?: unknown) {
    super(message, status, details);
    this.name = "ProfileApiError";
  }
}

export class HttpProfileRepository implements ProfileRepository {
  async getMyProfile(accessToken: string): Promise<ProfileViewModel | null> {
    try {
      const response = await apiClient.get<unknown>(apiConfig.routes.profiles.root, {
        token: accessToken,
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
    accessToken: string
  ): Promise<ProfileViewModel> {
    const payload = {
      username: command.username.value,
      imageUrl: command.imageUrl.value,
    };

    const response = await apiClient.put<unknown>(
      apiConfig.routes.profiles.root,
      payload,
      {
        token: accessToken,
        errorMessage: "Failed to update profile",
        errorType: ProfileApiError,
      }
    );

    return profileFromApiResponse(response);
  }

  async updatePreferences(
    command: UpdateProfilePreferencesCommand,
    accessToken: string
  ): Promise<ProfileViewModel> {
    const payload = {
      language: command.preferences.language,
      theme: command.preferences.theme,
    };

    const response = await apiClient.put<unknown>(
      apiConfig.routes.profiles.preferences,
      payload,
      {
        token: accessToken,
        errorMessage: "Failed to update preferences",
        errorType: ProfileApiError,
      }
    );

    return profileFromApiResponse(response);
  }
}
