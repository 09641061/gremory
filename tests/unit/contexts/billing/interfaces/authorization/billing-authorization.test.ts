import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getHeaderViewModel: vi.fn(),
}));

vi.mock("@/contexts/business/interfaces/server/business-composition", () => ({
  composeBusinessAdapters: () => ({
    workspaceQueryService: {
      getHeaderViewModel: mocks.getHeaderViewModel,
    },
  }),
}));

import {
  requireSubscriptionOwnerAccess,
  requireTenantBillingManager,
} from "@/contexts/billing/interfaces/authorization/billing-authorization";

function workspace(overrides: Record<string, unknown> = {}) {
  return {
    accountType: "OWNER",
    organization: undefined,
    ownedOrganizationId: null,
    accessPolicy: { canManageBilling: false },
    authorization: undefined,
    subscription: { canManageBilling: false },
    ...overrides,
  };
}

describe("billing authorization boundaries", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should authorize initial-owner checkout without emitting a tenant header", async () => {
    // Arrange
    mocks.getHeaderViewModel.mockResolvedValue(workspace({
      subscription: { canManageBilling: true },
    }));

    // Act
    const context = await requireSubscriptionOwnerAccess("corr-initial");

    // Assert
    expect(context).toEqual({ correlationId: "corr-initial" });
  });

  it("should resolve the owned organization for a subscription owner with a tenant", async () => {
    // Arrange
    mocks.getHeaderViewModel.mockResolvedValue(workspace({
      organization: { id: "org-1" },
      ownedOrganizationId: "org-1",
      accessPolicy: { canManageBilling: true },
    }));

    // Act
    const context = await requireSubscriptionOwnerAccess("corr-owner");

    // Assert
    expect(context).toEqual({ correlationId: "corr-owner", tenantId: "org-1" });
  });

  it("should reject a member at the subscription-owner boundary", async () => {
    // Arrange
    mocks.getHeaderViewModel.mockResolvedValue(workspace({
      accountType: "MEMBER",
      organization: { id: "foreign-org" },
    }));

    // Act
    const operation = requireSubscriptionOwnerAccess("corr-member");

    // Assert
    await expect(operation).rejects.toMatchObject({
      name: "BillingAuthorizationError",
      status: 403,
      reason: "OWNER_REQUIRED",
    });
  });

  it("should reject tenant billing management before an organization exists", async () => {
    // Arrange
    mocks.getHeaderViewModel.mockResolvedValue(workspace({
      subscription: { canManageBilling: true },
    }));

    // Act
    const operation = requireTenantBillingManager("corr-no-tenant");

    // Assert
    await expect(operation).rejects.toMatchObject({
      name: "BillingAuthorizationError",
      status: 403,
      reason: "ORGANIZATION_REQUIRED",
    });
  });
});
