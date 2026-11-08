import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  cookies: { get: vi.fn() },
  revalidatePath: vi.fn(),
  requireSubscriptionOwnerAccess: vi.fn(),
  execute: vi.fn(),
}));

vi.mock("next/headers", () => ({ cookies: vi.fn(() => mocks.cookies) }));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));
vi.mock("@/contexts/billing/interfaces/authorization/billing-authorization", () => ({
  requireSubscriptionOwnerAccess: mocks.requireSubscriptionOwnerAccess,
}));
vi.mock("@/contexts/billing/interfaces/server/billing-composition", () => ({
  composeBillingAdapters: () => ({
    createSubscriptionService: { execute: mocks.execute },
  }),
}));

import { createSubscriptionAction } from "@/contexts/billing/interfaces/actions/create-subscription.action";

const subscription = {
  id: "sub-1",
  ownerId: "user-1",
  planId: 1,
  billingCycle: "MONTHLY",
  status: "PENDING",
};

describe("createSubscriptionAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.cookies.get.mockReturnValue({ value: "access-token" });
    mocks.requireSubscriptionOwnerAccess.mockResolvedValue({ correlationId: "corr-1" });
    mocks.execute.mockResolvedValue(subscription);
  });

  it("should submit initial checkout without requiring an organization tenant", async () => {
    // Arrange
    const input = { planId: 1, billingCycle: "MONTHLY" as const, currency: "USD" as const };

    // Act
    const result = await createSubscriptionAction(input);

    // Assert
    expect(result).toEqual({ status: "success", data: subscription, error: null, errorKind: null });
    expect(mocks.execute).toHaveBeenCalledWith(
      "access-token",
      input,
      { correlationId: "corr-1" },
    );
  });

  it("should return an authorization error without exposing the server exception", async () => {
    // Arrange
    const authorizationError = Object.assign(new Error("private authorization details"), {
      name: "BillingAuthorizationError",
      status: 403,
    });
    mocks.requireSubscriptionOwnerAccess.mockRejectedValue(authorizationError);

    // Act
    const result = await createSubscriptionAction({
      planId: 1,
      billingCycle: "MONTHLY",
      currency: "USD",
    });

    // Assert
    expect(result).toEqual({
      status: "error",
      data: null,
      error: "Operation not permitted",
      errorKind: "authorization",
    });
    expect(result.error).not.toContain("private authorization details");
    expect(mocks.execute).not.toHaveBeenCalled();
  });

  it("should return an authentication error before resolving billing access when the cookie is missing", async () => {
    // Arrange
    mocks.cookies.get.mockReturnValue(undefined);

    // Act
    const result = await createSubscriptionAction({
      planId: 1,
      billingCycle: "MONTHLY",
      currency: "USD",
    });

    // Assert
    expect(result).toEqual({
      status: "error",
      data: null,
      error: "You must be signed in to select a subscription plan.",
      errorKind: "authentication",
    });
    expect(mocks.requireSubscriptionOwnerAccess).not.toHaveBeenCalled();
    expect(mocks.execute).not.toHaveBeenCalled();
  });
});
