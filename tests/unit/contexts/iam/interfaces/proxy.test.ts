import { NextRequest } from "next/server";
import { proxy } from "@/proxy";

const mocks = {
  resolveSession: vi.fn(),
};

vi.mock("@/contexts/iam/application/internal/queryservices/iam-session-query.service", () => ({
  createIamSessionQueryService: () => mocks,
}));

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

describe("IAM session proxy", () => {
  beforeEach(() => {
    mocks.resolveSession.mockReset();
    mocks.resolveSession.mockResolvedValue({
      status: "authenticated",
      accessToken: "access-token",
      rotatedSession: null,
    });
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ active: true, status: "ACTIVE", planId: 1 }), { status: 200 }),
    ));
  });

  it("should refresh the session and update cookies when verification rejects the token", async () => {
    // Arrange
    mocks.resolveSession.mockResolvedValue({
      status: "authenticated",
      accessToken: "new-access-token",
      rotatedSession: {
        accessToken: "new-access-token",
        refreshToken: "new-refresh-token",
      },
    });

    // Act
    const response = await proxy(
      requestWithSession("access-token", "refresh-token", "/chat"),
    );

    // Assert
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
    // Arrange
    const request = requestWithSession();

    // Act
    const response = await proxy(request);

    // Assert
    expect(mocks.resolveSession).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost/chat");
  });

  it("should clear the session and redirect to login when refresh is rejected", async () => {
    // Arrange
    mocks.resolveSession.mockResolvedValue({ status: "unauthenticated" });

    // Act
    const response = await proxy(requestWithSession());

    // Assert
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost/login");
    expect(response.cookies.get("takodu.access_token")?.value).toBe("");
  });

  it.each(["/organizations", "/establishments"])(
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

  it("should send free sessions from home to schedule", async () => {
    vi.stubGlobal("fetch", vi.fn()
      .mockResolvedValueOnce(new Response(
        JSON.stringify({ active: true, status: "ACTIVE", planId: 0 }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      )));

    const response = await proxy(requestWithSession(
      "access-token",
      "refresh-token",
      "/",
    ));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost/schedule");
  });

  it("should allow an active workforce member without a personal subscription", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(
        JSON.stringify({ message: "Subscription not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } },
      ))
      .mockResolvedValueOnce(new Response(
        JSON.stringify({ active: true, member: true }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ));
    vi.stubGlobal("fetch", fetchMock);

    const response = await proxy(requestWithSession(
      "access-token",
      "refresh-token",
      "/chat",
    ));

    expect(response.status).toBe(200);
    expect(response.headers.get("location")).toBeNull();
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "http://localhost:8080/api/workforce/access",
      expect.objectContaining({
        headers: { Authorization: "Bearer access-token" },
      }),
    );
  });

  it("should redirect a removed workforce member to subscribe", async () => {
    vi.stubGlobal("fetch", vi.fn()
      .mockResolvedValueOnce(new Response(
        JSON.stringify({ message: "Subscription not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } },
      ))
      .mockResolvedValueOnce(new Response(
        JSON.stringify({ active: false, member: true }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      )));

    const response = await proxy(requestWithSession(
      "access-token",
      "refresh-token",
      "/chat",
    ));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost/subscribe");
  });
});
