import { describe, expect, it } from "vitest";
import {
  en,
  es,
  getNotificationDictionary,
} from "@/contexts/notifications/interfaces/i18n";

describe("Notifications i18n translations", () => {
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
    expect(en.notifications.title).toBe("Notifications");
    expect(es.notifications.title).toBe("Notificaciones");
    expect(en.notifications.empty).toBe("You have no pending notifications");
    expect(es.notifications.empty).toBe("No tienes notificaciones pendientes");
  });

  it("should return the correct dictionary by locale", () => {
    expect(getNotificationDictionary("es")).toBe(es);
    expect(getNotificationDictionary("en")).toBe(en);
    expect(getNotificationDictionary(null)).toBe(en);
  });
});
