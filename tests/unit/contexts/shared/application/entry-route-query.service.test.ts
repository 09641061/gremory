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

  it("keeps an owner in establishment onboarding when the workspace reports it", async () => {
    mocks.getWorkspace.mockResolvedValue({
      accountType: "OWNER",
      onboardingStatus: "ESTABLISHMENT_PENDING",
    });

    const result = await createEntryRouteQueryService().resolveRoute({
      accessToken: "access-token",
    });

    expect(result).toEqual({
      status: "establishment-required",
      setupHref: "/establishments/new",
      allowedPaths: ["/establishments/new"],
    });
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
        canOpenScheduling: true,
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

  it("lands a member with an editable establishment on the establishments page when no module is openable", async () => {
    mocks.getWorkspace.mockResolvedValue({
      accountType: "MEMBER",
      onboardingStatus: "COMPLETED",
      onboardingCompleted: true,
      organization: {
        id: "org-1",
        name: "Acme",
        imageUrl: null,
        permissions: { canRead: true, canUpdate: false, canCreateEstablishment: false },
      },
      establishments: [
        {
          id: "est-1",
          name: "Main",
          photoUrl: null,
          canUpdate: true,
        },
      ],
      activeEstablishmentId: "est-1",
      accessPolicy: {
        canUseAssistant: false,
      },
      canReadEstablishments: true,
    });

    const result = await createEntryRouteQueryService().resolveRoute({
      accessToken: "access-token",
    });

    expect(result).toEqual({
      status: "ready",
      homeHref: "/establishments",
    });
  });

  it("keeps a member without readable or editable establishments at access denied", async () => {
    mocks.getWorkspace.mockResolvedValue({
      accountType: "MEMBER",
      onboardingStatus: "COMPLETED",
      onboardingCompleted: true,
      organization: {
        id: "org-1",
        name: "Acme",
        imageUrl: null,
        permissions: { canRead: true, canUpdate: false, canCreateEstablishment: false },
      },
      establishments: [
        {
          id: "est-1",
          name: "Main",
          photoUrl: null,
          canUpdate: false,
        },
      ],
      activeEstablishmentId: "est-1",
      accessPolicy: {
        canUseAssistant: false,
      },
      canReadEstablishments: true,
    });

    const result = await createEntryRouteQueryService().resolveRoute({
      accessToken: "access-token",
    });

    expect(result).toEqual({
      status: "ready",
      homeHref: "/access-denied",
    });
  });

  it("lands a guest with only establishment:update on the establishments page", async () => {
    mocks.getWorkspace.mockResolvedValue({
      accountType: "MEMBER",
      onboardingStatus: "COMPLETED",
      onboardingCompleted: true,
      organization: {
        id: "org-1",
        name: "Acme",
        imageUrl: null,
        permissions: { canRead: true, canUpdate: false, canCreateEstablishment: false },
      },
      establishments: [
        {
          id: "est-1",
          name: "Main",
          photoUrl: null,
          effectivePermissions: ["establishment:update"],
          canUpdate: true,
          organizationId: "org-1",
          organizationName: "Acme",
        },
      ],
      activeEstablishmentId: "est-1",
      accessPolicy: {
        canUseAssistant: false,
      },
      canReadEstablishments: true,
    });

    const result = await createEntryRouteQueryService().resolveRoute({
      accessToken: "access-token",
    });

    expect(result).toEqual({
      status: "ready",
      homeHref: "/establishments",
    });
  });

  it("lands a member with only analytics access on the analytics page", async () => {
    mocks.getWorkspace.mockResolvedValue({
      accountType: "MEMBER",
      onboardingStatus: "COMPLETED",
      onboardingCompleted: true,
      organization: {
        id: "org-1",
        name: "Acme",
        imageUrl: null,
        permissions: { canRead: true, canUpdate: false, canCreateEstablishment: false },
      },
      establishments: [
        {
          id: "est-1",
          name: "Main",
          photoUrl: null,
          effectivePermissions: ["analytics:read"],
          permissions: { canRead: true, canUpdate: false, canDelete: false },
          organizationId: "org-1",
          organizationName: "Acme",
        },
      ],
      activeEstablishmentId: "est-1",
      accessPolicy: {
        canUseAssistant: false,
        canOpenAnalytics: true,
      },
      canReadEstablishments: true,
    });

    const result = await createEntryRouteQueryService().resolveRoute({
      accessToken: "access-token",
    });

    expect(result).toEqual({
      status: "ready",
      homeHref: "/analytics",
    });
  });
});
