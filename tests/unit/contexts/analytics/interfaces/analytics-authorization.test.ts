import { describe, expect, it } from "vitest";
import { canRequestMaxAnalytics } from "@/contexts/analytics/interfaces/authorization/analytics-authorization";

describe("canRequestMaxAnalytics", () => {
  it("requires explicit analytics capabilities", () => {
    expect(
      canRequestMaxAnalytics({
        capabilities: { canReadAnalytics: true },
        accessPolicy: { canOpenAnalytics: true },
      }),
    ).toBe(true);
  });

  it("denies Max when the capability is absent regardless of plan display name", () => {
    expect(
      canRequestMaxAnalytics({
        capabilities: { canReadAnalytics: false },
        accessPolicy: { canOpenAnalytics: true },
      }),
    ).toBe(false);
    expect(
      canRequestMaxAnalytics({
        capabilities: { canReadAnalytics: true },
        accessPolicy: { canOpenAnalytics: false },
      }),
    ).toBe(false);
  });

  it("denies missing capability fields", () => {
    expect(canRequestMaxAnalytics({})).toBe(false);
  });
});
