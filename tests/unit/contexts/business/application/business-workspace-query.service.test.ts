import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getWorkspace: vi.fn(),
}));

vi.mock(
  "@/contexts/business/infrastructure/gateways/business-workspace-api.gateway",
  () => ({
    BusinessWorkspaceApiGateway: class {
      getWorkspace = mocks.getWorkspace;
    },
  }),
);

import { createBusinessWorkspaceQueryService } from "@/contexts/business/application/internal/queryservices/business-workspace-query.service";

const organizationId = "11111111-1111-4111-8111-111111111111";
const establishmentId = "44444444-4444-4444-8444-444444444444";
const secondEstablishmentId = "55555555-5555-4555-8555-555555555555";

function workspace(overrides: Record<string, unknown> = {}) {
  return {
    accountType: "OWNER",
    organization: {
      id: organizationId,
      name: "Takodu Studio",
      imageUrl: null,
      permissions: { canRead: true, canUpdate: true, canCreateEstablishment: true },
    },
    establishments: [],
    activeEstablishmentId: null,
    capabilities: undefined,
    accessPolicy: undefined,
    subscription: { active: true, planName: "Free", status: "ACTIVE", canManageBilling: true },
    pendingInvitation: null,
    ...overrides,
  };
}

describe("business workspace query service", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("resolves the single organization of an owner with its own subscription", async () => {
    mocks.getWorkspace.mockResolvedValue(
      workspace({
        capabilities: {
          canReadAnalytics: true,
        },
        authorization: {
          role: "OWNER",
          scope: {
            type: "ORGANIZATION",
            id: organizationId,
            name: "Takodu Studio",
          },
          capabilities: {
            canEditOrganizationProfile: true,
            canEditEstablishmentProfile: true,
            canManageMembers: true,
            canManageBilling: true,
            canOpenModules: true,
            canInviteUsers: true,
          },
        },
        accessPolicy: {
          canUseAssistant: true,
        },
        establishments: [
          {
            id: establishmentId,
            name: "Main branch",
            photoUrl: null,
            effectivePermissions: [],
            permissions: { canRead: true, canUpdate: true, canDelete: true },
          },
        ],
        activeEstablishmentId: establishmentId,
      }),
    );

    const result = await createBusinessWorkspaceQueryService().getHeaderViewModel();

    expect(result.accountType).toBe("OWNER");
    expect(result.organization?.id).toBe(organizationId);
    expect(result.activeEstablishmentId).toBe(establishmentId);
    expect(result.subscription?.canManageBilling).toBe(true);
    expect(result.authorization).toEqual({
      role: "OWNER",
      scope: {
        type: "ORGANIZATION",
        id: organizationId,
        name: "Takodu Studio",
      },
      capabilities: {
        canEditOrganizationProfile: true,
        canEditEstablishmentProfile: true,
        canManageMembers: true,
        canManageBilling: true,
        canOpenModules: true,
        canInviteUsers: true,
      },
    });
    expect(result.capabilities).toEqual({
      canReadAppointments: undefined,
      canReadCatalog: undefined,
      canReadCustomers: undefined,
      canReadTeam: undefined,
      canReadAnalytics: true,
    });
    expect(result.accessPolicy).toEqual({
      canOpenAnalytics: true,
      canOpenScheduling: false,
      canOpenCrm: false,
      canOpenCatalog: false,
      canOpenTeam: false,
      canUseAssistant: true,
      canCreateEstablishment: true,
      canManageBilling: true,
    });
    expect(result.canCreateEstablishment).toBe(true);
  });

  it("keeps the owner creation entry point visible when Billing reports a plan limit", async () => {
    mocks.getWorkspace.mockResolvedValue(
      workspace({
        organization: {
          id: organizationId,
          name: "Takodu Studio",
          imageUrl: null,
          permissions: { canRead: true, canUpdate: true, canCreateEstablishment: false },
        },
      }),
    );

    const result = await createBusinessWorkspaceQueryService().getHeaderViewModel();

    expect(result.canCreateEstablishment).toBe(true);
  });

  it("reads a member against the owner's subscription and denies billing", async () => {
    mocks.getWorkspace.mockResolvedValue(
      workspace({
        accountType: "MEMBER",
        organization: {
          id: organizationId,
          name: "Takodu Studio",
          imageUrl: null,
          permissions: { canRead: true, canUpdate: false, canCreateEstablishment: false },
        },
        establishments: [
          {
            id: establishmentId,
            name: "Main branch",
            photoUrl: null,
            effectivePermissions: ["catalog:read"],
            permissions: { canRead: true, canUpdate: false, canDelete: false },
          },
        ],
        activeEstablishmentId: establishmentId,
        subscription: { active: false, planName: "Free", status: "PAST_DUE", canManageBilling: false },
      }),
    );

    const result = await createBusinessWorkspaceQueryService().getHeaderViewModel();

    expect(result.accountType).toBe("MEMBER");
    expect(result.canCreateEstablishment).toBe(false);
    expect(result.subscription?.active).toBe(false);
    expect(result.subscription?.canManageBilling).toBe(false);
    expect(result.accessPolicy).toEqual({
      canOpenAnalytics: false,
      canOpenScheduling: false,
      canOpenCrm: false,
      canOpenCatalog: false,
      canOpenTeam: false,
      canCreateEstablishment: false,
      canManageBilling: false,
    });
  });

  it("hides establishments the member cannot read", async () => {
    mocks.getWorkspace.mockResolvedValue(
      workspace({
        accountType: "MEMBER",
        establishments: [
          {
            id: establishmentId,
            name: "Main branch",
            photoUrl: null,
            effectivePermissions: [],
            permissions: { canRead: false, canUpdate: false, canDelete: false },
          },
          {
            id: secondEstablishmentId,
            name: "Second branch",
            photoUrl: null,
            effectivePermissions: ["crm:read"],
            permissions: { canRead: true, canUpdate: false, canDelete: false },
          },
        ],
        activeEstablishmentId: establishmentId,
      }),
    );

    const result = await createBusinessWorkspaceQueryService().getHeaderViewModel();

    expect(result.establishments.map((establishment) => establishment.id)).toEqual([
      secondEstablishmentId,
    ]);
    // The requested establishment is unreadable, so the first readable one wins.
    expect(result.activeEstablishmentId).toBe(secondEstablishmentId);
  });

  it("surfaces the pending invitation of an account that has not accepted yet", async () => {
    mocks.getWorkspace.mockResolvedValue(
      workspace({
        accountType: "PENDING_INVITATION",
        organization: null,
        subscription: null,
        pendingInvitation: {
          establishmentId,
          organizationName: "Takodu Studio",
          establishmentName: "Main branch",
          expiresAt: "2026-09-01T00:00:00Z",
        },
      }),
    );

    const result = await createBusinessWorkspaceQueryService().getHeaderViewModel();

    expect(result.accountType).toBe("PENDING_INVITATION");
    expect(result.organization).toBeUndefined();
    expect(result.pendingInvitation?.organizationName).toBe("Takodu Studio");
  });

  it("accepts a null authorization block during onboarding", async () => {
    mocks.getWorkspace.mockResolvedValue(
      workspace({
        accountType: "OWNER",
        organization: null,
        authorization: null,
      }),
    );

    const result = await createBusinessWorkspaceQueryService().getHeaderViewModel();

    expect(result.authorization).toBeUndefined();
  });

  it("drops an incomplete authorization block during onboarding", async () => {
    mocks.getWorkspace.mockResolvedValue(
      workspace({
        accountType: "OWNER",
        organization: null,
        authorization: {
          role: "OWNER",
          scope: {
            type: null,
            id: null,
            name: null,
          },
          capabilities: {
            canEditOrganizationProfile: true,
            canEditEstablishmentProfile: true,
            canManageMembers: true,
            canManageBilling: true,
            canOpenModules: true,
            canInviteUsers: true,
          },
        },
      }),
    );

    const result = await createBusinessWorkspaceQueryService().getHeaderViewModel();

    expect(result.authorization).toBeUndefined();
  });

  it("denies the organization page when the account cannot read its organization", async () => {
    mocks.getWorkspace.mockResolvedValue(
      workspace({
        accountType: "MEMBER",
        organization: {
          id: organizationId,
          name: "Takodu Studio",
          imageUrl: null,
          permissions: { canRead: false, canUpdate: false, canCreateEstablishment: false },
        },
      }),
    );

    const state = await createBusinessWorkspaceQueryService().getOrganizationPageState();

    expect(state.status).toBe("denied");
  });

  it("returns the organization settings state for the owner", async () => {
    mocks.getWorkspace.mockResolvedValue(
      workspace({
        establishments: [
          {
            id: establishmentId,
            name: "Main branch",
            photoUrl: null,
            effectivePermissions: [],
            permissions: { canRead: true, canUpdate: true, canDelete: true },
          },
        ],
      }),
    );

    const state = await createBusinessWorkspaceQueryService().getOrganizationPageState();

    expect(state).toEqual({
      status: "ready",
      organization: expect.objectContaining({ id: organizationId }),
      canUpdate: true,
    });
  });
});
