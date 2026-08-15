import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getWorkspace: vi.fn(),
  resolve: vi.fn(),
}));

vi.mock("@/contexts/shared/application/internal/outboundservices/business-workspace.outbound.service", () => ({
  createBusinessWorkspaceOutboundService: () => ({
    getWorkspace: mocks.getWorkspace,
  }),
}));

vi.mock("@/contexts/billing/application/internal/queryservices/subscription-access-query.service", () => ({
  createSubscriptionAccessQueryService: () => ({
    resolve: mocks.resolve,
  }),
}));

import { createEntryRouteQueryService } from "@/contexts/shared/application/internal/queryservices/entry-route-query.service";

describe("entry route query service", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.resolve.mockReturnValue({
      hasAssistantAccess: true,
      homeHref: "/chat",
    });
  });

  it("uses the workspace assistant policy before the subscription fallback", async () => {
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
      subscription: { active: true, status: "ACTIVE", planId: 1 },
    });

    expect(result).toEqual({
      status: "ready",
      homeHref: "/schedule",
    });
  });
});
