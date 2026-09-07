import { describe, expect, it } from "vitest";
import {
  hasActiveSubscription,
  hasAssistantSubscriptionAccess,
  isAssistantPermissionLocked,
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

  it("should lock the assistant permission without an active subscription", () => {
    expect(
      isAssistantPermissionLocked({
        active: false,
        status: "ACTIVE",
        planName: "Standard",
      }),
    ).toBe(true);

    expect(
      isAssistantPermissionLocked({
        active: true,
        status: "SUSPENDED",
        planName: "Standard",
      }),
    ).toBe(true);
  });

  it("should not lock the assistant permission on paid active plans", () => {
    expect(
      isAssistantPermissionLocked({
        active: true,
        status: "ACTIVE",
        planName: "Standard",
      }),
    ).toBe(false);

    expect(
      isAssistantPermissionLocked({
        active: true,
        status: "ACTIVE",
        planName: "Max",
      }),
    ).toBe(false);
  });

  it("should lock the assistant permission without subscription data", () => {
    expect(isAssistantPermissionLocked(null)).toBe(true);
    expect(isAssistantPermissionLocked(undefined)).toBe(true);
  });
});
