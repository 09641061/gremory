import { beforeEach, describe, expect, it, vi } from "vitest";
import { HttpProfileRepository, ProfileApiError } from "@/contexts/profiles/infrastructure/repositories/http-profile.repository";
import { ApiError, apiClient } from "@/contexts/shared/infrastructure/http/api-client";
import { createUsername } from "@/contexts/profiles/domain/model/valueobjects/username";
import { createProfileImageUrl } from "@/contexts/profiles/domain/model/valueobjects/profile-image-url";
import { defaultProfilePreferences } from "@/contexts/profiles/domain/model/valueobjects/profile-preferences";

vi.mock("@/contexts/shared/infrastructure/http/api-client", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/contexts/shared/infrastructure/http/api-client")>();
  return {
    ...actual,
    apiClient: {
      get: vi.fn(),
      put: vi.fn(),
    },
  };
});

describe("HttpProfileRepository", () => {
  let repository: HttpProfileRepository;
  const rawApiResponse = {
    username: "mateo",
    imageUrl: "https://example.com/avatar.jpg",
    language: "ES",
    theme: "SYSTEM",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    repository = new HttpProfileRepository();
  });

  describe("getMyProfile", () => {
    it("should fetch user profile and map the API response", async () => {
      // Arrange
      vi.mocked(apiClient.get).mockResolvedValue(rawApiResponse);

      // Act
      const result = await repository.getMyProfile("token-abc");

      // Assert
      expect(result).toEqual({
        username: "mateo",
        imageUrl: "https://example.com/avatar.jpg",
        language: "ES",
        theme: "SYSTEM",
      });
      expect(apiClient.get).toHaveBeenCalledWith(
        "/api/v1/profiles",
        expect.objectContaining({ token: "token-abc" })
      );
    });

    it("should return null when ApiError status is 404", async () => {
      // Arrange
      vi.mocked(apiClient.get).mockRejectedValue(new ApiError("Not found", 404));

      // Act
      const result = await repository.getMyProfile("token-abc");

      // Assert
      expect(result).toBeNull();
    });

    it("should rethrow non-404 ApiErrors", async () => {
      // Arrange
      vi.mocked(apiClient.get).mockRejectedValue(new ApiError("Server error", 500));

      // Act & Assert
      await expect(repository.getMyProfile("token-abc")).rejects.toThrow("Server error");
    });
  });

  describe("updateProfile", () => {
    it("should update profile via apiClient.put when no image file is provided", async () => {
      // Arrange
      vi.mocked(apiClient.put).mockResolvedValue(rawApiResponse);
      const command = {
        username: createUsername("mateo"),
        imageUrl: createProfileImageUrl("https://example.com/avatar.jpg"),
      };

      // Act
      const result = await repository.updateProfile(command, "token-abc");

      // Assert
      expect(result).toEqual({
        username: "mateo",
        imageUrl: "https://example.com/avatar.jpg",
        language: "ES",
        theme: "SYSTEM",
      });
      expect(apiClient.put).toHaveBeenCalledWith(
        "/api/v1/profiles",
        { username: "mateo", imageUrl: "https://example.com/avatar.jpg" },
        expect.objectContaining({ token: "token-abc" })
      );
    });

    it("should update profile using multipart FormData when image file is present", async () => {
      // Arrange
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(rawApiResponse),
      });
      vi.stubGlobal("fetch", mockFetch);

      const dummyFile = new File(["bytes"], "photo.png", { type: "image/png" });
      const command = {
        username: createUsername("mateo"),
        imageUrl: createProfileImageUrl(null),
        imageFile: dummyFile,
      };

      // Act
      const result = await repository.updateProfile(command, "token-abc");

      // Assert
      expect(result).toEqual({
        username: "mateo",
        imageUrl: "https://example.com/avatar.jpg",
        language: "ES",
        theme: "SYSTEM",
      });
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v1/profiles"),
        expect.objectContaining({
          method: "PUT",
          headers: { Authorization: "Bearer token-abc" },
          body: expect.any(FormData),
        })
      );
    });

    it("should throw ProfileApiError when update with image fails", async () => {
      // Arrange
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        json: vi.fn().mockResolvedValue({ message: "Invalid image format" }),
      });
      vi.stubGlobal("fetch", mockFetch);

      const dummyFile = new File(["bytes"], "photo.png", { type: "image/png" });
      const command = {
        username: createUsername("mateo"),
        imageUrl: createProfileImageUrl(null),
        imageFile: dummyFile,
      };

      // Act & Assert
      await expect(repository.updateProfile(command, "token-abc")).rejects.toThrow("Invalid image format");
    });
  });

  describe("updatePreferences", () => {
    it("should update preferences via apiClient.put", async () => {
      // Arrange
      vi.mocked(apiClient.put).mockResolvedValue(rawApiResponse);
      const command = {
        preferences: defaultProfilePreferences(),
      };

      // Act
      const result = await repository.updatePreferences(command, "token-abc");

      // Assert
      expect(result).toEqual({
        username: "mateo",
        imageUrl: "https://example.com/avatar.jpg",
        language: "ES",
        theme: "SYSTEM",
      });
      expect(apiClient.put).toHaveBeenCalledWith(
        "/api/v1/profiles/preferences",
        { language: "ES", theme: "SYSTEM" },
        expect.objectContaining({ token: "token-abc" })
      );
    });
  });
});
