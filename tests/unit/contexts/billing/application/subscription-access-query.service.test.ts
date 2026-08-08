import { describe, expect, it } from "vitest";
import { createSubscriptionAccessQueryService } from "@/contexts/billing/application/internal/queryservices/subscription-access-query.service";

describe("subscription access query service", () => {
  const service = createSubscriptionAccessQueryService();

  it("should treat free active subscriptions as core access without assistant access", () => {
    const access = service.resolve({
      active: true,
      status: "ACTIVE",
      planId: 0,
    });

    expect(access.isActive).toBe(true);
    expect(access.hasAssistantAccess).toBe(false);
    expect(access.homeHref).toBe("/schedule");
  });

  it("should enable assistant access for paid active subscriptions", () => {
    const access = service.resolve({
      active: true,
      status: "ACTIVE",
      planId: 1,
    });

    expect(access.isActive).toBe(true);
    expect(access.hasAssistantAccess).toBe(true);
    expect(access.homeHref).toBe("/chat");
  });

  it("should keep inactive subscriptions out of the application", () => {
    const access = service.resolve({
      active: false,
      status: "SUSPENDED",
      planId: 1,
    });

    expect(access.isActive).toBe(false);
    expect(access.hasAssistantAccess).toBe(false);
    expect(access.homeHref).toBe("/schedule");
  });
});
