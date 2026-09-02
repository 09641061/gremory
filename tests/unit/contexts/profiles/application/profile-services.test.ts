import { describe, expect, it, vi } from "vitest";
import { ProfileCommandServiceImpl } from "@/contexts/profiles/application/internal/commandservices/profile-command.service.impl";
import { ProfileQueryServiceImpl } from "@/contexts/profiles/application/internal/queryservices/profile-query.service.impl";
import type { ProfileRepository } from "@/contexts/profiles/domain/repositories/profile.repository";
import { createUsername } from "@/contexts/profiles/domain/model/valueobjects/username";
import { createProfileImageUrl } from "@/contexts/profiles/domain/model/valueobjects/profile-image-url";
import { defaultProfilePreferences } from "@/contexts/profiles/domain/model/valueobjects/profile-preferences";

describe("Profile Application Services", () => {
  const dummyProfile = {
    username: "mateo",
    imageUrl: "https://picsum.photos/seed/replik-test/800/600",
    language: "ES" as const,
    theme: "SYSTEM" as const,
  };

  const createMockRepository = (): ProfileRepository => ({
    getMyProfile: vi.fn(),
    updateProfile: vi.fn(),
    updatePreferences: vi.fn(),
  });

  describe("ProfileCommandServiceImpl", () => {
    it("should delegate updateProfile command to the repository", async () => {
      // Arrange
      const repository = createMockRepository();
      vi.mocked(repository.updateProfile).mockResolvedValue(dummyProfile);
      const service = new ProfileCommandServiceImpl(repository);

      const command = {
        username: createUsername("mateo"),
        imageUrl: createProfileImageUrl("https://picsum.photos/seed/replik-test/800/600"),
      };

      // Act
      const result = await service.updateProfile(command, "token-123");

      // Assert
      expect(result).toEqual(dummyProfile);
      expect(repository.updateProfile).toHaveBeenCalledWith(command, "token-123");
    });

    it("should delegate updatePreferences command to the repository", async () => {
      // Arrange
      const repository = createMockRepository();
      vi.mocked(repository.updatePreferences).mockResolvedValue(dummyProfile);
      const service = new ProfileCommandServiceImpl(repository);

      const command = {
        preferences: defaultProfilePreferences(),
      };

      // Act
      const result = await service.updatePreferences(command, "token-123");

      // Assert
      expect(result).toEqual(dummyProfile);
      expect(repository.updatePreferences).toHaveBeenCalledWith(command, "token-123");
    });
  });

  describe("ProfileQueryServiceImpl", () => {
    it("should delegate getMyProfile query to the repository and return profile", async () => {
      // Arrange
      const repository = createMockRepository();
      vi.mocked(repository.getMyProfile).mockResolvedValue(dummyProfile);
      const service = new ProfileQueryServiceImpl(repository);

      // Act
      const result = await service.getMyProfile({}, "token-123");

      // Assert
      expect(result).toEqual(dummyProfile);
      expect(repository.getMyProfile).toHaveBeenCalledWith("token-123");
    });

    it("should return null when getMyProfile returns null", async () => {
      // Arrange
      const repository = createMockRepository();
      vi.mocked(repository.getMyProfile).mockResolvedValue(null);
      const service = new ProfileQueryServiceImpl(repository);

      // Act
      const result = await service.getMyProfile({}, "token-123");

      // Assert
      expect(result).toBeNull();
    });
  });
});
