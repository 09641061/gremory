import { describe, expect, it } from "vitest";
import { createLanguage } from "@/contexts/profiles/domain/model/valueobjects/language";
import { createTheme } from "@/contexts/profiles/domain/model/valueobjects/theme";
import {
  createProfilePreferences,
  defaultProfilePreferences,
} from "@/contexts/profiles/domain/model/valueobjects/profile-preferences";
import { createProfileImageUrl } from "@/contexts/profiles/domain/model/valueobjects/profile-image-url";
import { createProfileId } from "@/contexts/profiles/domain/model/valueobjects/profile-id";

describe("Profile Value Objects", () => {
  describe("Language", () => {
    it("should accept valid language codes ES and EN regardless of casing", () => {
      expect(createLanguage("ES")).toBe("ES");
      expect(createLanguage("es")).toBe("ES");
      expect(createLanguage("EN")).toBe("EN");
      expect(createLanguage("en")).toBe("EN");
    });

    it("should throw error when given an unsupported language", () => {
      expect(() => createLanguage("FR")).toThrow("Language must be ES or EN");
      expect(() => createLanguage("")).toThrow("Language must be ES or EN");
    });
  });

  describe("Theme", () => {
    it("should accept valid themes LIGHT, DARK, SYSTEM regardless of casing", () => {
      expect(createTheme("LIGHT")).toBe("LIGHT");
      expect(createTheme("dark")).toBe("DARK");
      expect(createTheme("system")).toBe("SYSTEM");
    });

    it("should throw error when given an unsupported theme", () => {
      expect(() => createTheme("BLUE")).toThrow("Theme must be LIGHT, DARK, or SYSTEM");
      expect(() => createTheme("")).toThrow("Theme must be LIGHT, DARK, or SYSTEM");
    });
  });

  describe("ProfilePreferences", () => {
    it("should create frozen profile preferences", () => {
      const preferences = createProfilePreferences("EN", "DARK");
      expect(preferences.language).toBe("EN");
      expect(preferences.theme).toBe("DARK");
      expect(Object.isFrozen(preferences)).toBe(true);
    });

    it("should create default profile preferences as ES and SYSTEM", () => {
      const defaultPrefs = defaultProfilePreferences();
      expect(defaultPrefs.language).toBe("ES");
      expect(defaultPrefs.theme).toBe("SYSTEM");
    });
  });

  describe("ProfileImageUrl", () => {
    it("should create null image url when given empty or whitespace string", () => {
      expect(createProfileImageUrl(null).value).toBeNull();
      expect(createProfileImageUrl(undefined).value).toBeNull();
      expect(createProfileImageUrl("").value).toBeNull();
      expect(createProfileImageUrl("   ").value).toBeNull();
    });

    it("should trim and store valid image url", () => {
      const img = createProfileImageUrl("  https://example.com/pic.jpg  ");
      expect(img.value).toBe("https://example.com/pic.jpg");
      expect(Object.isFrozen(img)).toBe(true);
    });
  });

  describe("ProfileId", () => {
    it("should create frozen ProfileId when non-empty", () => {
      const id = createProfileId("prof-123");
      expect(id.value).toBe("prof-123");
      expect(Object.isFrozen(id)).toBe(true);
    });

    it("should throw error when ProfileId is empty", () => {
      expect(() => createProfileId("")).toThrow("ProfileId is required");
      expect(() => createProfileId("   ")).toThrow("ProfileId is required");
    });
  });
});
