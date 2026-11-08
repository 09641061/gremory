import { describe, expect, it } from "vitest";
import {
  en,
  es,
  getIamDictionary,
} from "@/contexts/iam/interfaces/i18n";

describe("IAM i18n translations", () => {
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
    expect(en.auth.continueToTakodu).toBe("Continue to Takodu");
    expect(es.auth.continueToTakodu).toBe("Continuar a Takodu");
    expect(en.auth.logOut).toBe("Log out");
    expect(es.auth.logOut).toBe("Cerrar sesión");
    expect(en.auth.checkEmail).toBe("Check your email");
    expect(es.auth.checkEmail).toBe("Revisa tu correo");
    expect(en.auth.invalidMagicLink).toBe("This sign-in link is invalid or has expired. Request a new one.");
    expect(es.auth.invalidMagicLink).toBe("Este enlace de inicio de sesión no es válido o ha caducado. Solicita uno nuevo.");
  });

  it("should return the correct dictionary by locale", () => {
    expect(getIamDictionary("es")).toBe(es);
    expect(getIamDictionary("en")).toBe(en);
    expect(getIamDictionary(null)).toBe(en);
  });
});
