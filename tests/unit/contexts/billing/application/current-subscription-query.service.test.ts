import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getCurrentSubscription: vi.fn(),
}));

vi.mock("@/contexts/billing/infrastructure/adapters/billing-subscription.adapter", () => ({
  createBillingSubscriptionAdapter: () => ({
    getCurrentSubscription: mocks.getCurrentSubscription,
  }),
}));

import { createCurrentSubscriptionQueryService } from "@/contexts/billing/application/internal/queryservices/current-subscription-query.service";

describe("current subscription query service", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("returns the snapshot when Billing reports a subscription", async () => {
    mocks.getCurrentSubscription.mockResolvedValue({ active: true, status: "ACTIVE", planId: 1 });

    const snapshot = await createCurrentSubscriptionQueryService()
      .getCurrentSubscriptionSnapshot("token");

    expect(snapshot).toEqual({ active: true, status: "ACTIVE", planId: 1 });
  });

  it("returns null instead of throwing when the user owns no subscription", async () => {
    mocks.getCurrentSubscription.mockRejectedValue({ status: 404 });

    const snapshot = await createCurrentSubscriptionQueryService()
      .getCurrentSubscriptionSnapshot("token");

    expect(snapshot).toBeNull();
  });

  it("keeps propagating the failure on the strict read used by route handlers", async () => {
    mocks.getCurrentSubscription.mockRejectedValue(new Error("billing down"));

    await expect(
      createCurrentSubscriptionQueryService().getCurrentSubscription("token"),
    ).rejects.toThrow("billing down");
  });
});
