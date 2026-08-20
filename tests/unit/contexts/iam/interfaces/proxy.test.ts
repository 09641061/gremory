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
  extraCookies: Record<string, string> = {},
) {
  const cookie = [
    accessToken ? `takodu.access_token=${accessToken}` : null,
    refreshToken ? `takodu.refresh_token=${refreshToken}` : null,
    ...Object.entries(extraCookies).map(([name, value]) => `${name}=${value}`),
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
    accessPolicy: {
      canUseAssistant: false,
      canOpenAnalytics: true,
      canOpenScheduling: true,
      canOpenCrm: true,
      canOpenCatalog: true,
      canOpenTeam: true,
      canCreateEstablishment: true,
      canManageBilling: true,
    },
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
    stubFetch(workspace());
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
    expect(response.status).toBe(307);
  });

  it("should keep both the rotated session cookie and the establishment header when rotation and workspace context happen together", async () => {
    mocks.resolveSession.mockResolvedValue({
      status: "authenticated",
      accessToken: "new-access-token",
      rotatedSession: {
        accessToken: "new-access-token",
        refreshToken: "new-refresh-token",
      },
    });
    stubFetch(workspace({
      accountType: "MEMBER",
      establishments: [establishment(establishmentId, ["scheduling:read"])],
    }));

    const response = await proxy(
      requestWithSession(
        "access-token",
        "refresh-token",
        `/schedule?establishmentId=${establishmentId}`,
      ),
    );

    // The rotated cookie must reach the browser...
    expect(response.cookies.get("takodu.access_token")?.value).toBe("new-access-token");
    expect(response.cookies.get("takodu.refresh_token")?.value).toBe("new-refresh-token");

    // ...and the establishment header override must not have been dropped by
    // the rotation, i.e. both survive on the single forwarded-request headers
    // list rather than one clobbering the other.
    const overrideHeaderNames = (response.headers.get("x-middleware-override-headers") ?? "")
      .split(",")
      .map((name) => name.trim());
    expect(overrideHeaderNames).toContain("x-takodu-establishment-id");
    expect(response.headers.get("x-middleware-request-x-takodu-establishment-id")).toBe(establishmentId);
  });

  it("should redirect an active session from home to the dashboard", async () => {
    const response = await proxy(requestWithSession());

    expect(mocks.resolveSession).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost/schedule");
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
    expect(response.headers.get("location")).toBe("http://localhost/schedule");
  });

  it("should send an account that never accepted its invitation to the acceptance screen", async () => {
    stubFetch(workspace({
      accountType: "PENDING_INVITATION",
      organization: null,
      establishments: [],
      activeEstablishmentId: null,
      subscription: null,
      pendingInvitation: {
        establishmentId,
        organizationName: "Takodu",
        establishmentName: "Main",
        expiresAt: "2026-09-01T00:00:00Z",
      },
    }));

    const response = await proxy(requestWithSession("access-token", "refresh-token", "/"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost/invitations/pending");
  });

  it("should keep the acceptance screen reachable while the invitation is pending", async () => {
    stubFetch(workspace({
      accountType: "PENDING_INVITATION",
      organization: null,
      establishments: [],
      activeEstablishmentId: null,
      subscription: null,
    }));

    const response = await proxy(requestWithSession(
      "access-token",
      "refresh-token",
      "/invitations/pending",
    ));

    expect(response.status).toBe(200);
    expect(response.headers.get("location")).toBeNull();
  });

  it("should send an owner with an empty organization to the first-establishment setup", async () => {
    stubFetch(workspace({ establishments: [], activeEstablishmentId: null }));

    const response = await proxy(requestWithSession("access-token", "refresh-token", "/chat"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost/establishments/new");
  });

  it("should use the workspace assistant policy for the landing route", async () => {
    stubFetch(workspace({
      accessPolicy: {
        canUseAssistant: false,
        canOpenAnalytics: true,
        canOpenScheduling: true,
        canOpenCrm: true,
        canOpenCatalog: true,
        canOpenTeam: true,
        canCreateEstablishment: true,
        canManageBilling: true,
      },
    }));

    const response = await proxy(requestWithSession("access-token", "refresh-token", "/"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost/schedule");
  });

  it("should keep the upgrade page available for authenticated users", async () => {
    const response = await proxy(requestWithSession("access-token", "refresh-token", "/upgrade"));

    expect(response.status).toBe(200);
    expect(response.headers.get("location")).toBeNull();
  });

  it("should resolve the workspace from a single call", async () => {
    const fetchMock = stubFetch(
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
      1,
      "http://localhost:8080/api/business/workspace",
      expect.objectContaining({
        headers: { Authorization: "Bearer access-token" },
      }),
    );
  });

  it("should resolve landing against the persisted establishment, not the account's default identity", async () => {
    const fetchMock = stubFetch(
      workspace({
        accountType: "MEMBER",
        establishments: [establishment(establishmentId, ["scheduling:read"])],
      }),
    );

    // No establishmentId in the url: only the cookie carries the account's
    // actual, persisted selection - it must still reach the landing call.
    await proxy(
      requestWithSession("access-token", "refresh-token", "/", {
        "takodu.active_establishment_id": establishmentId,
      }),
    );

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      `http://localhost:8080/api/business/workspace?establishmentId=${establishmentId}`,
      expect.objectContaining({
        headers: { Authorization: "Bearer access-token" },
      }),
    );
  });

  it("should redirect a member to the module its permissions allow", async () => {
    stubFetch(workspace({
      accountType: "MEMBER",
      establishments: [establishment(establishmentId, ["scheduling:read"])],
    }));

    const response = await proxy(requestWithSession("access-token", "refresh-token", "/"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost/schedule");
  });

  it("should redirect a member to the first accessible module when scheduling is missing", async () => {
    stubFetch(workspace({
      accountType: "MEMBER",
      establishments: [establishment(establishmentId, ["catalog:read"])],
      accessPolicy: {
        canOpenScheduling: false,
        canOpenCatalog: true,
        canOpenCrm: false,
        canOpenTeam: false,
        canOpenAnalytics: false,
        canUseAssistant: false,
        canCreateEstablishment: false,
        canManageBilling: false,
      },
    }));

    const response = await proxy(requestWithSession("access-token", "refresh-token", "/"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost/catalog");
  });

  it("should keep a member in the app shell when no module is readable", async () => {
    stubFetch(workspace({
      accountType: "MEMBER",
      establishments: [establishment(establishmentId, [])],
      organization: {
        id: organizationId,
        name: "Takodu",
        imageUrl: null,
        permissions: { canRead: false, canUpdate: false, canCreateEstablishment: false },
      },
      accessPolicy: {
        canOpenScheduling: false,
        canOpenCatalog: false,
        canOpenCrm: false,
        canOpenTeam: false,
        canOpenAnalytics: false,
        canUseAssistant: false,
        canCreateEstablishment: false,
        canManageBilling: false,
      },
    }));

    const response = await proxy(requestWithSession("access-token", "refresh-token", "/"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost/access-denied");
  });

  it("should persist an explicit establishment selection into a cookie", async () => {
    stubFetch(workspace({
      accountType: "MEMBER",
      establishments: [establishment(establishmentId, ["scheduling:read"])],
    }));

    const response = await proxy(
      requestWithSession("access-token", "refresh-token", `/schedule?establishmentId=${establishmentId}`),
    );

    expect(response.cookies.get("takodu.active_establishment_id")?.value).toBe(establishmentId);
  });

  it("should fall back to the persisted establishment when the url carries no selection", async () => {
    stubFetch(workspace({
      accountType: "MEMBER",
      establishments: [establishment(establishmentId, ["scheduling:read"])],
    }));

    const response = await proxy(
      requestWithSession("access-token", "refresh-token", "/schedule", {
        "takodu.active_establishment_id": establishmentId,
      }),
    );

    // A cookie-only selection is rewritten into the URL the page resolves
    // `searchParams` from, not just forwarded as a header - so the request
    // reaching `/schedule` carries it as if it had been typed there.
    expect(response.headers.get("x-middleware-rewrite")).toContain(`establishmentId=${establishmentId}`);
  });

  it("should not rewrite when the url already carries its own establishment selection", async () => {
    stubFetch(workspace({
      accountType: "MEMBER",
      establishments: [establishment(establishmentId, ["scheduling:read"])],
    }));
    const otherEstablishmentId = "55555555-5555-4555-8555-555555555555";

    const response = await proxy(
      requestWithSession("access-token", "refresh-token", `/schedule?establishmentId=${establishmentId}`, {
        "takodu.active_establishment_id": otherEstablishmentId,
      }),
    );

    expect(response.headers.get("x-middleware-rewrite")).toBeNull();
    // The explicit selection wins and becomes the new persisted value.
    expect(response.cookies.get("takodu.active_establishment_id")?.value).toBe(establishmentId);
  });

  it("should send a new owner to create their establishment even while holding a membership establishment elsewhere", async () => {
    const foreignEstablishmentId = "33333333-3333-4333-8333-333333333333";
    const foreignOrganizationId = "44444444-4444-4444-8444-444444444444";

    stubFetch(workspace({
      accountType: "OWNER",
      onboardingStatus: "ESTABLISHMENT_PENDING",
      onboardingCompleted: false,
      // `establishments` is combined across every organization the account
      // touches, so it is not empty even though the owner's own new
      // organization has no establishment of its own yet.
      establishments: [
        {
          ...establishment(foreignEstablishmentId, ["scheduling:read"]),
          organizationId: foreignOrganizationId,
          organizationName: "Host Org",
        },
      ],
      activeEstablishmentId: null,
    }));

    const response = await proxy(requestWithSession("access-token", "refresh-token", "/chat"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost/establishments/new");
  });

  it("should not send a removed member to subscribe", async () => {
    stubFetch(workspace({
      accountType: "PENDING_INVITATION",
      organization: null,
      establishments: [],
      activeEstablishmentId: null,
      subscription: null,
    }));

    const response = await proxy(requestWithSession("access-token", "refresh-token", "/chat"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost/invitations/pending");
  });

  it("should deny a member left without any readable establishment", async () => {
    stubFetch(workspace({
      accountType: "MEMBER",
      organization: {
        id: organizationId,
        name: "Takodu",
        imageUrl: null,
        permissions: { canRead: false, canUpdate: false, canCreateEstablishment: false },
      },
      establishments: [],
      activeEstablishmentId: null,
    }));

    const response = await proxy(requestWithSession("access-token", "refresh-token", "/chat"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost/access-denied");
  });
});
