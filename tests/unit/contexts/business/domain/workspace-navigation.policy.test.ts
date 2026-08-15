import { describe, expect, it } from "vitest";

import {
  buildWorkspacePath,
  canManageOrganization,
  groupEstablishmentsByOrganization,
  hasSomewhereToCancelTo,
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

describe("hasSomewhereToCancelTo", () => {
  it("has nowhere to cancel to for a fresh owner mid mandatory onboarding", () => {
    expect(hasSomewhereToCancelTo([], "org-1", false)).toBe(false);
  });

  it("can cancel once onboarding is already completed, e.g. adding another establishment", () => {
    expect(hasSomewhereToCancelTo([], "org-1", true)).toBe(true);
  });

  it("can cancel to a host organization while its own new organization is still incomplete", () => {
    // A member starting its own business: the new organization is not
    // onboardingCompleted yet, but the host establishment it already has is
    // a valid place to return to.
    expect(
      hasSomewhereToCancelTo([{ organizationId: "host-org" }], "own-org", false),
    ).toBe(true);
  });

  it("ignores establishments that belong to the same organization being onboarded", () => {
    expect(
      hasSomewhereToCancelTo([{ organizationId: "org-1" }], "org-1", false),
    ).toBe(false);
  });
});

describe("groupEstablishmentsByOrganization", () => {
  it("groups establishments by their organization, in first-seen order", () => {
    const groups = groupEstablishmentsByOrganization([
      { id: "est-1", name: "Main", organizationId: "org-1", organizationName: "Acme" },
      { id: "est-2", name: "Second", organizationId: "org-2", organizationName: "Host Org" },
      { id: "est-3", name: "Third", organizationId: "org-1", organizationName: "Acme" },
    ]);

    expect(groups).toEqual([
      {
        organizationId: "org-1",
        organizationName: "Acme",
        organizationImageUrl: null,
        establishments: [
          { id: "est-1", name: "Main", organizationId: "org-1", organizationName: "Acme" },
          { id: "est-3", name: "Third", organizationId: "org-1", organizationName: "Acme" },
        ],
      },
      {
        organizationId: "org-2",
        organizationName: "Host Org",
        organizationImageUrl: null,
        establishments: [
          { id: "est-2", name: "Second", organizationId: "org-2", organizationName: "Host Org" },
        ],
      },
    ]);
  });

  it("falls back to the current organization for establishments without their own tag, keeping its logo", () => {
    const groups = groupEstablishmentsByOrganization(
      [{ id: "est-1", name: "Main" }],
      "org-1",
      "Acme",
      "https://cdn.test/acme.png",
    );

    expect(groups).toEqual([
      {
        organizationId: "org-1",
        organizationName: "Acme",
        organizationImageUrl: "https://cdn.test/acme.png",
        establishments: [{ id: "est-1", name: "Main" }],
      },
    ]);
  });

  it("drops an establishment that cannot be attributed to any organization", () => {
    expect(groupEstablishmentsByOrganization([{ id: "est-1", name: "Main" }])).toEqual([]);
  });

  it("never attaches the active organization's logo to a foreign one", () => {
    const groups = groupEstablishmentsByOrganization(
      [{ id: "est-1", name: "Main", organizationId: "org-2", organizationName: "Host Org" }],
      "org-1",
      "Acme",
      "https://cdn.test/acme.png",
    );

    expect(groups[0]?.organizationImageUrl).toBeNull();
  });

  it("uses the logo carried by the establishment itself for a foreign organization", () => {
    // The backend now batches each establishment's own organization's logo in,
    // so a foreign organization is no longer stuck without one.
    const groups = groupEstablishmentsByOrganization([
      {
        id: "est-1",
        name: "Main",
        organizationId: "org-2",
        organizationName: "Host Org",
        organizationImageUrl: "https://cdn.test/host.png",
      },
    ]);

    expect(groups[0]?.organizationImageUrl).toBe("https://cdn.test/host.png");
  });
});

describe("canManageOrganization", () => {
  it("always allows editing the organization the account owns", () => {
    expect(
      canManageOrganization({ organizationId: "org-1", establishments: [] }, "org-1"),
    ).toBe(true);
  });

  it("denies editing a foreign organization without a granted business:manage permission", () => {
    expect(
      canManageOrganization(
        { organizationId: "org-2", establishments: [{ id: "est-1", name: "Main", effectivePermissions: ["scheduling:read"] }] },
        "org-1",
      ),
    ).toBe(false);
  });

  it("allows editing a foreign organization when a membership was granted business:manage", () => {
    expect(
      canManageOrganization(
        { organizationId: "org-2", establishments: [{ id: "est-1", name: "Main", effectivePermissions: ["business:manage"] }] },
        "org-1",
      ),
    ).toBe(true);
  });
});
