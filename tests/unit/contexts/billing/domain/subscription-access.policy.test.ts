import { describe, expect, it } from "vitest";
import {
  hasActiveSubscription,
  hasAssistantSubscriptionAccess,
} from "@/contexts/billing/domain/services/subscription-access.policy";

describe("subscription access policy", () => {
  it("should treat any active ACTIVE subscription as active access", () => {
    expect(
      hasActiveSubscription({
        active: true,
        status: "ACTIVE",
        planId: 0,
      }),
    ).toBe(true);
  });

  it("should require a paid plan for assistant access", () => {
    expect(
      hasAssistantSubscriptionAccess({
        active: true,
        status: "ACTIVE",
        planId: 0,
      }),
    ).toBe(false);

    expect(
      hasAssistantSubscriptionAccess({
        active: true,
        status: "ACTIVE",
        planId: 1,
      }),
    ).toBe(true);
  });

  it("should reject inactive or non-active subscriptions", () => {
    expect(
      hasAssistantSubscriptionAccess({
        active: false,
        status: "ACTIVE",
        planId: 1,
      }),
    ).toBe(false);

    expect(
      hasAssistantSubscriptionAccess({
        active: true,
        status: "SUSPENDED",
        planId: 1,
      }),
    ).toBe(false);
  });
});
