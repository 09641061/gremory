import { describe, expect, it } from "vitest";
import {
  en,
  es,
  getProfilesDictionary,
} from "@/contexts/profiles/interfaces/i18n";

describe("Profiles i18n translations", () => {
  it("should have matching keys between en and es dictionaries", () => {
    function collectKeys(obj: Record<string, unknown>, prefix = ""): string[] {
      const keys: string[] = [];
      for (const [key, value] of Object.entries(obj)) {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        if (value && typeof value === "object" && !Array.isArray(value)) {
          keys.push(...collectKeys(value as Record<string, unknown>, fullKey));
        } else {
          keys.push(fullKey);
        }
      }
      return keys.sort();
    }

    expect(collectKeys(es as unknown as Record<string, unknown>)).toEqual(
      collectKeys(en as unknown as Record<string, unknown>)
    );
  });

  it("should provide non-empty strings in both locales", () => {
    expect(en.sidebarProfile.profile).toBe("Profile");
    expect(es.sidebarProfile.profile).toBe("Perfil");
    expect(en.preferences.title).toBe("Preferences");
    expect(es.preferences.title).toBe("Preferencias");
    expect(en.profile.pageTitle).toBe("Profile");
    expect(es.profile.pageTitle).toBe("Perfil");
  });

  it("should return the correct dictionary by locale", () => {
    expect(getProfilesDictionary("es")).toBe(es);
    expect(getProfilesDictionary("en")).toBe(en);
    expect(getProfilesDictionary(null)).toBe(en);
  });
});
