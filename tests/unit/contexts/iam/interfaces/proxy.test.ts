import { NextRequest } from "next/server";
import { proxy } from "@/proxy";

const mocks = vi.hoisted(() => ({
  refreshSession: vi.fn(),
}));

vi.mock("@/contexts/iam/application/internal/commandservices/iam-authentication-command.service", () => ({
  createIamAuthenticationCommandService: () => mocks,
}));

function requestWithSession(accessToken = "access-token", refreshToken = "refresh-token") {
  return new NextRequest("http://localhost/", {
    headers: {
      cookie: `takodu.access_token=${accessToken}; takodu.refresh_token=${refreshToken}`,
    },
  });
}

describe("IAM session proxy", () => {
  beforeEach(() => {
    mocks.refreshSession.mockReset();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ active: true, status: "ACTIVE" }), { status: 200 }),
    ));
  });

  it("should refresh the session and update cookies when verification rejects the token", async () => {
    // Arrange
    vi.stubGlobal("fetch", vi.fn()
      .mockResolvedValueOnce(new Response(null, { status: 401 }))
      .mockResolvedValueOnce(new Response(null, { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ active: true, status: "ACTIVE" }), { status: 200 })));
    mocks.refreshSession.mockResolvedValue({
      accessToken: "new-access-token",
      refreshToken: "new-refresh-token",
    });

    // Act
    const response = await proxy(requestWithSession());

    // Assert
    expect(mocks.refreshSession).toHaveBeenCalledWith({ refreshToken: "refresh-token" });
    expect(response.cookies.get("takodu.access_token")?.value).toBe("new-access-token");
    expect(response.cookies.get("takodu.refresh_token")?.value).toBe("new-refresh-token");
  });

  it("should redirect an active session from home to the dashboard", async () => {
    // Arrange
    const request = requestWithSession();

    // Act
    const response = await proxy(request);

    // Assert
    expect(mocks.refreshSession).not.toHaveBeenCalled();
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost/chat");
  });

  it("should clear the session and redirect to login when refresh is rejected", async () => {
    // Arrange
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: 401 })));
    mocks.refreshSession.mockRejectedValue(new Error("Refresh token expired"));

    // Act
    const response = await proxy(requestWithSession());

    // Assert
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost/login");
    expect(response.cookies.get("takodu.access_token")?.value).toBe("");
  });

  it("should share one refresh request between concurrent requests", async () => {
    let verificationCalls = 0;
    vi.stubGlobal("fetch", vi.fn().mockImplementation(() => {
      verificationCalls += 1;
      return Promise.resolve(
        new Response(
          verificationCalls <= 2 ? null : JSON.stringify({ active: true, status: "ACTIVE" }),
          { status: verificationCalls <= 2 ? 401 : 200 },
        ),
      );
    }));
    let resolveRefresh: ((value: { accessToken: string; refreshToken: string }) => void) | undefined;
    mocks.refreshSession.mockReturnValue(new Promise((resolve) => {
      resolveRefresh = resolve;
    }));

    const first = proxy(requestWithSession());
    const second = proxy(requestWithSession());

    expect(mocks.refreshSession).toHaveBeenCalledTimes(1);

    resolveRefresh?.({
      accessToken: "new-access-token",
      refreshToken: "new-refresh-token",
    });

    await Promise.all([first, second]);
    expect(mocks.refreshSession).toHaveBeenCalledTimes(1);
  });
});
