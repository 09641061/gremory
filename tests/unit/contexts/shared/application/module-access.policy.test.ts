import { describe, expect, it } from "vitest";
import { resolveModuleAccessFallback } from "@/contexts/shared/application/services/module-access.policy";

describe("resolveModuleAccessFallback", () => {
  it("sends an owner with an inactive subscription to billing", () => {
    expect(
      resolveModuleAccessFallback({
        accountType: "OWNER",
        subscription: { active: false, canManageBilling: true },
        accessPolicy: { canManageBilling: true },
      } as never),
    ).toBe("/upgrade");
  });

  it("keeps permission failures on access denied", () => {
    expect(
      resolveModuleAccessFallback({
        accountType: "MEMBER",
        subscription: { active: false, canManageBilling: false },
        accessPolicy: { canManageBilling: false },
      } as never),
    ).toBe("/access-denied");
  });
});
