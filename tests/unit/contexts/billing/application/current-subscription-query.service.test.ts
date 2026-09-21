import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getCurrentSubscription: vi.fn(),
}));

import { CurrentSubscriptionQueryService } from "@/contexts/billing/application/internal/queryservices/current-subscription-query.service";
import type { BillingSubscriptionReader } from "@/contexts/billing/application/ports/billing-readers-writers";

describe("current subscription query service", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("returns the snapshot when Billing reports a subscription", async () => {
    mocks.getCurrentSubscription.mockResolvedValue({ active: true, status: "ACTIVE", planId: 1 });

    const reader: BillingSubscriptionReader = { getCurrentSubscription: mocks.getCurrentSubscription };
    const snapshot = await new CurrentSubscriptionQueryService(reader)
      .getCurrentSubscriptionSnapshot("token");

    expect(snapshot).toEqual({ active: true, status: "ACTIVE", planId: 1 });
  });

  it("returns null instead of throwing when the user owns no subscription", async () => {
    mocks.getCurrentSubscription.mockRejectedValue({ status: 404 });

    const reader: BillingSubscriptionReader = { getCurrentSubscription: mocks.getCurrentSubscription };
    const snapshot = await new CurrentSubscriptionQueryService(reader)
      .getCurrentSubscriptionSnapshot("token");

    expect(snapshot).toBeNull();
  });

  it("keeps propagating the failure on the strict read used by route handlers", async () => {
    mocks.getCurrentSubscription.mockRejectedValue(new Error("billing down"));

    const reader: BillingSubscriptionReader = { getCurrentSubscription: mocks.getCurrentSubscription };

    await expect(
      new CurrentSubscriptionQueryService(reader).getCurrentSubscription("token"),
    ).rejects.toThrow("billing down");
  });
});
