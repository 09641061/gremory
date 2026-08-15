import { NextRequest } from "next/server";
import { proxy } from "@/proxy";

const mocks = {
  resolveSession: vi.fn(),
};

vi.mock("@/contexts/iam/application/internal/queryservices/iam-session-query.service", () => ({
  createIamSessionQueryService: () => mocks,
}));

const organizationId = "11111111-1111-4111-8111-111111111111";
const establishmentId = "22222222-2222-4222-8222-222222222222";

function requestWithSession(
  accessToken: string | null = "access-token",
  refreshToken: string | null = "refresh-token",
  pathname = "/",
) {
  const cookie = [
    accessToken ? `takodu.access_token=${accessToken}` : null,
    refreshToken ? `takodu.refresh_token=${refreshToken}` : null,
  ].filter(Boolean).join("; ");

  return new NextRequest(`http://localhost${pathname}`, {
    headers: cookie ? { cookie } : undefined,
  });
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function subscription(planId = 1) {
  return jsonResponse({ active: true, status: "ACTIVE", planId });
}

function establishment(id: string, effectivePermissions: ReadonlyArray<string>) {
  return {
    id,
    name: "Main",
    photoUrl: null,
    effectivePermissions,
    permissions: { canRead: true, canUpdate: false, canDelete: false },
  };
}

/**
 * The single bootstrap call the proxy now makes. `accountType` is read, never
 * inferred, so each scenario states it explicitly.
 */
function workspace(overrides: Record<string, unknown> = {}) {
  return jsonResponse({
    accountType: "OWNER",
    onboardingStatus: "COMPLETED",
    onboardingCompleted: true,
    organization: {
      id: organizationId,
      name: "Takodu",
      imageUrl: null,
      permissions: { canRead: true, canUpdate: true, canCreateEstablishment: true },
    },
    establishments: [establishment(establishmentId, [])],
    activeEstablishmentId: establishmentId,
    subscription: { active: true, planName: "Free", status: "ACTIVE", canManageBilling: true },
    pendingInvitation: null,
    ...overrides,
  });
}

function stubFetch(...responses: ReadonlyArray<Response>) {
  const fetchMock = vi.fn();
  for (const response of responses) fetchMock.mockResolvedValueOnce(response);
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

describe("IAM session proxy", () => {
  beforeEach(() => {
    mocks.resolveSession.mockReset();
    mocks.resolveSession.mockResolvedValue({
      status: "authenticated",
      accessToken: "access-token",
      rotatedSession: null,
    });
    stubFetch(subscription(), workspace());
  });

  it("should refresh the session and update cookies when verification rejects the token", async () => {
    mocks.resolveSession.mockResolvedValue({
      status: "authenticated",
      accessToken: "new-access-token",
      rotatedSession: {
        accessToken: "new-access-token",
        refreshToken: "new-refresh-token",
      },
    });

    const response = await proxy(
      requestWithSession("access-token", "refresh-token", "/chat"),
    );

    expect(mocks.resolveSession).toHaveBeenCalledWith({
      accessToken: "access-token",
      refreshToken: "refresh-token",
    });
    expect(response.cookies.get("takodu.access_token")?.value).toBe("new-access-token");
    expect(response.cookies.get("takodu.refresh_token")?.value).toBe("new-refresh-token");
    expect(response.headers.get("x-middleware-request-cookie")).toContain(
      "takodu.access_token=new-access-token",
    );
  });

  it("should redirect an active session from home to the dashboard", async () => {
    const response = await proxy(requestWithSession());

    expect(mocks.resolveSession).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost/chat");
  });

  it("should clear the session and redirect to login when refresh is rejected", async () => {
    mocks.resolveSession.mockResolvedValue({ status: "unauthenticated" });

    const response = await proxy(requestWithSession());

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost/login");
    expect(response.cookies.get("takodu.access_token")?.value).toBe("");
  });

  it.each(["/organization", "/establishments"])(
    "should protect the business route %s",
    async (pathname) => {
      mocks.resolveSession.mockResolvedValue({ status: "unauthenticated" });

      const response = await proxy(requestWithSession(null, null, pathname));

      expect(response.status).toBe(307);
      expect(response.headers.get("location")).toBe("http://localhost/login");
    },
  );

  it("should refresh when only the refresh-token cookie remains", async () => {
    mocks.resolveSession.mockResolvedValue({
      status: "authenticated",
      accessToken: "new-access-token",
      rotatedSession: {
        accessToken: "new-access-token",
        refreshToken: "new-refresh-token",
      },
    });

    const response = await proxy(requestWithSession(null, "refresh-token"));

    expect(mocks.resolveSession).toHaveBeenCalledWith({
      accessToken: undefined,
      refreshToken: "refresh-token",
    });
    expect(response.cookies.get("takodu.access_token")?.value).toBe("new-access-token");
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost/chat");
  });

  it("should send an account that never accepted its invitation to the acceptance screen", async () => {
    stubFetch(
      subscription(0),
      workspace({
        accountType: "PENDING_INVITATION",
        organization: null,
        establishments: [],
        activeEstablishmentId: null,
        subscription: null,
        pendingInvitation: {
          organizationName: "Takodu",
          establishmentName: "Main",
          expiresAt: "2026-09-01T00:00:00Z",
        },
      }),
    );

    const response = await proxy(requestWithSession("access-token", "refresh-token", "/"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost/invitations/pending");
  });

  it("should keep the acceptance screen reachable while the invitation is pending", async () => {
    stubFetch(
      subscription(0),
      workspace({
        accountType: "PENDING_INVITATION",
        organization: null,
        establishments: [],
        activeEstablishmentId: null,
        subscription: null,
      }),
    );

    const response = await proxy(requestWithSession(
      "access-token",
      "refresh-token",
      "/invitations/pending",
    ));

    expect(response.status).toBe(200);
    expect(response.headers.get("location")).toBeNull();
  });

  it("should send an owner with an empty organization to the first-establishment setup", async () => {
    stubFetch(
      subscription(0),
      workspace({ establishments: [], activeEstablishmentId: null }),
    );

    const response = await proxy(requestWithSession("access-token", "refresh-token", "/chat"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost/establishments/new");
  });

  it("should keep the upgrade page available for authenticated users", async () => {
    const response = await proxy(requestWithSession("access-token", "refresh-token", "/upgrade"));

    expect(response.status).toBe(200);
    expect(response.headers.get("location")).toBeNull();
  });

  it("should resolve the workspace from a single call", async () => {
    const fetchMock = stubFetch(
      jsonResponse({ message: "Subscription not found" }, 404),
      workspace({
        accountType: "MEMBER",
        establishments: [establishment(establishmentId, ["scheduling:read"])],
      }),
    );

    const response = await proxy(requestWithSession(
      "access-token",
      "refresh-token",
      "/schedule",
    ));

    expect(response.status).toBe(200);
    expect(response.headers.get("location")).toBeNull();
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "http://localhost:8080/api/business/workspace",
      expect.objectContaining({
        headers: { Authorization: "Bearer access-token" },
      }),
    );
  });

  it("should redirect a member to the module its permissions allow", async () => {
    stubFetch(
      subscription(0),
      workspace({
        accountType: "MEMBER",
        establishments: [establishment(establishmentId, ["scheduling:read"])],
      }),
    );

    const response = await proxy(requestWithSession("access-token", "refresh-token", "/"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost/schedule");
  });

  it("should redirect a member to the first accessible module when scheduling is missing", async () => {
    stubFetch(
      subscription(0),
      workspace({
        accountType: "MEMBER",
        establishments: [establishment(establishmentId, ["catalog:read"])],
      }),
    );

    const response = await proxy(requestWithSession("access-token", "refresh-token", "/"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost/catalog");
  });

  it("should not send a removed member to subscribe", async () => {
    stubFetch(
      jsonResponse({ message: "Subscription not found" }, 404),
      workspace({
        accountType: "PENDING_INVITATION",
        organization: null,
        establishments: [],
        activeEstablishmentId: null,
        subscription: null,
      }),
    );

    const response = await proxy(requestWithSession("access-token", "refresh-token", "/chat"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost/invitations/pending");
  });

  it("should deny a member left without any readable establishment", async () => {
    stubFetch(
      subscription(0),
      workspace({
        accountType: "MEMBER",
        organization: {
          id: organizationId,
          name: "Takodu",
          imageUrl: null,
          permissions: { canRead: false, canUpdate: false, canCreateEstablishment: false },
        },
        establishments: [],
        activeEstablishmentId: null,
      }),
    );

    const response = await proxy(requestWithSession("access-token", "refresh-token", "/chat"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost/access-denied");
  });
});
