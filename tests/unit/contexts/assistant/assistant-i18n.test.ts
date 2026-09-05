import { describe, expect, it } from "vitest";
import {
  en,
  es,
  getAssistantDictionary,
} from "@/contexts/assistant/interfaces/i18n";

describe("Assistant i18n translations", () => {
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

    expect(collectKeys(es)).toEqual(collectKeys(en));
  });

  it("should provide non-empty strings in both locales", () => {
    expect(en.chat.placeholder).toBe("Ask what you need about Takodu");
    expect(es.chat.placeholder).toBe("Pregunta lo que necesites sobre Takodu");
    expect(en.chat.sendMessage).toBe("Send message");
    expect(es.chat.sendMessage).toBe("Enviar mensaje");
  });

  it("should return the correct dictionary by locale", () => {
    expect(getAssistantDictionary("es")).toBe(es);
    expect(getAssistantDictionary("en")).toBe(en);
    expect(getAssistantDictionary(null)).toBe(en);
  });
});
