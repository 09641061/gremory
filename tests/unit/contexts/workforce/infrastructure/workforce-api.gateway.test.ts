import { afterEach, describe, expect, it, vi } from "vitest";

import { WorkforceApiGateway } from "@/contexts/workforce/infrastructure/workforce-api.gateway";

const organizationId = "11111111-1111-4111-8111-111111111111";
const establishmentId = "22222222-2222-4222-8222-222222222222";
const invitationId = "33333333-3333-4333-8333-333333333333";
const userId = "44444444-4444-4444-8444-444444444444";

function response(body: unknown, status = 200) {
  return new Response(body === undefined ? null : JSON.stringify(body), { status });
}

describe("Workforce API gateway", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("sends the tenant header and no authorization concept when inviting", async () => {
    const fetchMock = vi.fn().mockResolvedValue(response({
      id: invitationId,
      organizationId,
      organizationName: "Takodu",
      establishmentId,
      establishmentName: "Centro",
      email: "persona@example.com",
      status: "PENDING",
      createdAt: "2026-10-20T12:00:00Z",
      expiresAt: "2026-10-27T12:00:00Z",
    }, 201));
    vi.stubGlobal("fetch", fetchMock);

    await new WorkforceApiGateway().invite("access-token", organizationId, {
      email: "persona@example.com",
      establishmentId,
    });

    const [, request] = fetchMock.mock.calls[0] as [string, RequestInit];
    const headers = new Headers(request.headers);
    expect(headers.get("Authorization")).toBe("Bearer access-token");
    expect(headers.get("X-Organization-Id")).toBe(organizationId);
    expect(JSON.parse(String(request.body))).toEqual({ email: "persona@example.com", establishmentId });
  });

  it("previews an invitation without credentials", async () => {
    const fetchMock = vi.fn().mockResolvedValue(response({
      organizationId,
      organizationName: "Takodu",
      establishmentId,
      establishmentName: "Centro",
      maskedEmail: "p***@example.com",
      expiresAt: "2026-10-27T12:00:00Z",
    }));
    vi.stubGlobal("fetch", fetchMock);

    const preview = await new WorkforceApiGateway().preview("tenant.invite.secret");

    expect(preview.maskedEmail).toBe("p***@example.com");
    const [, request] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(new Headers(request.headers).has("Authorization")).toBe(false);
  });

  it("accepts with the authenticated session and parses the membership", async () => {
    const fetchMock = vi.fn().mockResolvedValue(response({
      id: invitationId,
      organizationId,
      establishmentId,
      establishmentName: "Centro",
      userId,
      email: "persona@example.com",
      joinedAt: "2026-10-20T12:00:00Z",
    }));
    vi.stubGlobal("fetch", fetchMock);

    const result = await new WorkforceApiGateway().accept("access-token", "tenant.invite.secret");

    expect(result).toEqual({ organizationId, establishmentId });
    const [, request] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(new Headers(request.headers).get("Authorization")).toBe("Bearer access-token");
  });
});
