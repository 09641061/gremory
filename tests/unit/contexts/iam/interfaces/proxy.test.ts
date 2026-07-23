import { NextRequest } from "next/server";
import { proxy } from "@/proxy";

const mocks = vi.hoisted(() => ({
  refreshSession: vi.fn(),
}));

vi.mock("@/contexts/iam/application/internal/commandservices/iam-authentication-command.service", () => ({
  createIamAuthenticationCommandService: () => mocks,
}));

function tokenWithExpiration(expirationInSeconds: number): string {
  const payload = Buffer.from(JSON.stringify({ exp: expirationInSeconds })).toString("base64url");
  return `header.${payload}.signature`;
}

function requestWithSession(accessToken: string, refreshToken = "refresh-token") {
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

  it("should refresh the session and update cookies when the access token is about to expire", async () => {
    // Arrange
    const nowInSeconds = Math.floor(Date.now() / 1000);
    mocks.refreshSession.mockResolvedValue({
      accessToken: "new-access-token",
      refreshToken: "new-refresh-token",
      expiresIn: 600,
    });

    // Act
    const response = await proxy(requestWithSession(tokenWithExpiration(nowInSeconds + 10)));

    // Assert
    expect(mocks.refreshSession).toHaveBeenCalledWith({ refreshToken: "refresh-token" });
    expect(response.cookies.get("takodu.access_token")?.value).toBe("new-access-token");
    expect(response.cookies.get("takodu.refresh_token")?.value).toBe("new-refresh-token");
  });

  it("should redirect an active session from home to the dashboard", async () => {
    // Arrange
    const nowInSeconds = Math.floor(Date.now() / 1000);
    const request = requestWithSession(tokenWithExpiration(nowInSeconds + 600));

    // Act
    const response = await proxy(request);

    // Assert
    expect(mocks.refreshSession).not.toHaveBeenCalled();
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost/dashboard");
  });

  it("should clear the session and redirect to login when refresh is rejected", async () => {
    // Arrange
    const nowInSeconds = Math.floor(Date.now() / 1000);
    mocks.refreshSession.mockRejectedValue(new Error("Refresh token expired"));

    // Act
    const response = await proxy(requestWithSession(tokenWithExpiration(nowInSeconds - 1)));

    // Assert
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost/login");
    expect(response.cookies.get("takodu.access_token")?.value).toBe("");
  });
});
