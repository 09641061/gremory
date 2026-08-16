import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getWorkspace: vi.fn(),
}));

vi.mock("@/contexts/shared/application/internal/outboundservices/business-workspace.outbound.service", () => ({
  createBusinessWorkspaceOutboundService: () => ({
    getWorkspace: mocks.getWorkspace,
  }),
}));

import { createEntryRouteQueryService } from "@/contexts/shared/application/internal/queryservices/entry-route-query.service";

describe("entry route query service", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("uses the workspace assistant policy before any billing fallback", async () => {
    mocks.getWorkspace.mockResolvedValue({
      accountType: "OWNER",
      onboardingStatus: "COMPLETED",
      onboardingCompleted: true,
      organization: {
        id: "org-1",
        name: "Acme",
        imageUrl: null,
        permissions: { canRead: true, canUpdate: true, canCreateEstablishment: true },
      },
      establishments: [
        {
          id: "est-1",
          name: "Main",
          photoUrl: null,
          effectivePermissions: [],
          permissions: { canRead: true, canUpdate: true, canDelete: true },
        },
      ],
      activeEstablishmentId: "est-1",
      accessPolicy: {
        canUseAssistant: false,
        canCreateEstablishment: true,
      },
      canCreateEstablishment: true,
    });

    const result = await createEntryRouteQueryService().resolveRoute({
      accessToken: "access-token",
    });

    expect(result).toEqual({
      status: "ready",
      homeHref: "/schedule",
    });
  });
});
