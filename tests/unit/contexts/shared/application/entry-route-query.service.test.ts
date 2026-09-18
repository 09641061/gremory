import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getWorkspace: vi.fn(),
  getCurrentSubscription: vi.fn(),
}));

vi.mock("@/contexts/shared/application/internal/outboundservices/business-workspace.outbound.service", () => ({
  createBusinessWorkspaceOutboundService: () => ({
    getWorkspace: mocks.getWorkspace,
  }),
}));

vi.mock("@/contexts/billing/application/internal/queryservices/current-subscription-query.service", () => ({
  createCurrentSubscriptionQueryService: () => ({
    getCurrentSubscription: mocks.getCurrentSubscription,
  }),
}));

import { createEntryRouteQueryService } from "@/contexts/shared/application/internal/queryservices/entry-route-query.service";

describe("entry route query service", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.getCurrentSubscription.mockResolvedValue({
      active: true,
      status: "ACTIVE",
      planId: 1,
    });
  });

  it("sends an owner without an active subscription to welcome before workspace setup", async () => {
    mocks.getWorkspace.mockResolvedValue({
      accountType: "OWNER",
      onboardingStatus: "ORGANIZATION_PENDING",
      organization: undefined,
    });
    mocks.getCurrentSubscription.mockRejectedValue({ status: 404 });

    const result = await createEntryRouteQueryService().resolveRoute({
      accessToken: "access-token",
    });

    expect(result).toEqual({
      status: "subscription-required",
      setupHref: "/welcome",
      allowedPaths: ["/welcome"],
    });
  });

  it("does not convert a Billing outage into a missing subscription", async () => {
    mocks.getWorkspace.mockResolvedValue({
      accountType: "OWNER",
      onboardingStatus: "ORGANIZATION_PENDING",
      organization: undefined,
    });
    mocks.getCurrentSubscription.mockRejectedValue(new Error("billing down"));

    const result = await createEntryRouteQueryService().resolveRoute({
      accessToken: "access-token",
    });

    expect(result).toEqual({ status: "unavailable" });
  });

  it("keeps a member out of the owner subscription gate", async () => {
    mocks.getWorkspace.mockResolvedValue({
      accountType: "MEMBER",
      onboardingStatus: "COMPLETED",
      organization: {
        id: "org-1",
        name: "Acme",
        imageUrl: null,
        permissions: { canRead: true, canUpdate: false, canCreateEstablishment: false },
      },
      establishments: [{ id: "est-1", name: "Main", canUpdate: false }],
      accessPolicy: { canOpenScheduling: true },
      canReadEstablishments: true,
    });

    const result = await createEntryRouteQueryService().resolveRoute({
      accessToken: "access-token",
    });

    expect(result).toEqual({ status: "ready", homeHref: "/schedule" });
    expect(mocks.getCurrentSubscription).not.toHaveBeenCalled();
  });

  it("keeps an owner in establishment onboarding when the workspace reports it", async () => {
    mocks.getWorkspace.mockResolvedValue({
      accountType: "OWNER",
      onboardingStatus: "ESTABLISHMENT_PENDING",
      organization: {
        id: "org-1",
        name: "Acme",
        imageUrl: null,
        permissions: { canRead: true, canUpdate: true, canCreateEstablishment: true },
      },
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
