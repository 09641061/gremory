import { describe, expect, it } from "vitest";

import {
  buildWorkspacePath,
  resolveEstablishmentEntryPath,
} from "@/contexts/business/domain/services/workspace-navigation.policy";

describe("buildWorkspacePath", () => {
  it("keeps the selected establishment in the query string", () => {
    expect(buildWorkspacePath("/schedule", "", "est-1")).toBe("/schedule?establishmentId=est-1");
  });

  it("replaces an establishment that is already in the query string", () => {
    expect(buildWorkspacePath("/crm", "establishmentId=est-1&view=list", "est-2")).toBe(
      "/crm?establishmentId=est-2&view=list",
    );
  });

  it("drops the establishment when none is selected", () => {
    expect(buildWorkspacePath("/establishments", "establishmentId=est-1")).toBe("/establishments");
  });

  it("never carries the organization, which is fixed for the account", () => {
    expect(buildWorkspacePath("/catalog", "organizationId=org-1", "est-1")).toBe(
      "/catalog?establishmentId=est-1",
    );
  });
});

describe("resolveEstablishmentEntryPath", () => {
  const establishment = {
    id: "est-1",
    name: "Main branch",
    effectivePermissions: ["crm:read"],
  };

  it("keeps an owner on the screen it was already using", () => {
    expect(resolveEstablishmentEntryPath("OWNER", establishment, "/analytics")).toBe("/analytics");
  });

  it("sends a member to the first module its role can open", () => {
    expect(resolveEstablishmentEntryPath("MEMBER", establishment, "/analytics")).toBe("/crm");
  });

  it("falls back to the current screen when there is no establishment to enter", () => {
    expect(resolveEstablishmentEntryPath("MEMBER", undefined, "/analytics")).toBe("/analytics");
  });
});
