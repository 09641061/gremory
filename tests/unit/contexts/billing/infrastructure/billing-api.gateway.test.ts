import { describe, expect, it, vi } from "vitest";
import { BillingApiGateway } from "@/contexts/billing/infrastructure/gateways/billing-api.gateway";
import { ApiError } from "@/contexts/shared/infrastructure/http/api-client";

const subscription = {
  id: "sub-1", ownerId: "owner-1", planId: 1, billingCycle: "MONTHLY", status: "ACTIVE",
  pendingPlanId: null, pendingBillingCycle: null,
};
const response = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status });

describe("Billing gateway contract", () => {
  it("accepts nullable pending plan fields without requiring the UI to expose them", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(response(subscription)));
    const result = await new BillingApiGateway().getCurrentSubscription("token");
    expect(result.pendingPlanId).toBeNull();
    expect(result.pendingBillingCycle).toBeNull();
  });

  it("preserves RFC 7807 subscription errors", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(response({ type: "about:blank", title: "Unauthorized", status: 401, detail: "Authentication required" }, 401)));
    const error = await new BillingApiGateway().getCurrentSubscription("token").catch((caught: unknown) => caught);
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ status: 401, message: "Authentication required" });
  });
});
