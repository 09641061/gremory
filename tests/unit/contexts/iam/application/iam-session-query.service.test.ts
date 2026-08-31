import { IamSessionQueryServiceImpl } from "@/contexts/iam/application/internal/queryservices/iam-session-query.service";
import { IamApiError } from "@/contexts/iam/infrastructure/gateways/iam-api.gateway";

function dependencies() {
  const queries = { verifyAccessToken: vi.fn() };
  const commands = {
    requestEmailSignIn: vi.fn(),
    confirmEmailSignIn: vi.fn(),
    refreshSession: vi.fn(),
    signOut: vi.fn(),
    verifyMagicLink: vi.fn(),
    exchangeGoogleCode: vi.fn(),
  };
  const coordinator = vi.fn(
    (
      token: string,
      refresh: (refreshToken: string) => Promise<{
        accessToken: string;
        refreshToken: string;
      } | null>,
    ) => refresh(token),
  );

  return { queries, commands, coordinator };
}

describe("IamSessionQueryServiceImpl", () => {
  it("returns the current access token when it is valid", async () => {
    const { queries, commands, coordinator } = dependencies();
    queries.verifyAccessToken.mockResolvedValue("authenticated");
    const service = new IamSessionQueryServiceImpl(queries, commands, coordinator);

    const result = await service.resolveSession({
      accessToken: "access",
      refreshToken: "refresh",
    });

    expect(result).toEqual({
      status: "authenticated",
      accessToken: "access",
      rotatedSession: null,
    });
    expect(commands.refreshSession).not.toHaveBeenCalled();
  });

  it("rotates the refresh token when the access token is missing", async () => {
    const { queries, commands, coordinator } = dependencies();
    const rotatedSession = {
      accessToken: "new-access",
      refreshToken: "new-refresh",
    };
    commands.refreshSession.mockResolvedValue(rotatedSession);
    queries.verifyAccessToken.mockResolvedValue("authenticated");
    const service = new IamSessionQueryServiceImpl(queries, commands, coordinator);

    const result = await service.resolveSession({ refreshToken: "refresh" });

    expect(commands.refreshSession).toHaveBeenCalledWith({ refreshToken: "refresh" });
    expect(result).toEqual({
      status: "authenticated",
      accessToken: "new-access",
      rotatedSession,
    });
  });

  it("reports an invalid refresh token as unauthenticated", async () => {
    const { queries, commands, coordinator } = dependencies();
    commands.refreshSession.mockRejectedValue(
      new IamApiError("Invalid or expired refresh token", 401),
    );
    const service = new IamSessionQueryServiceImpl(queries, commands, coordinator);

    await expect(
      service.resolveSession({ accessToken: "expired", refreshToken: "refresh" }),
    ).resolves.toEqual({ status: "unauthenticated" });
  });

  it("does not invalidate the browser session when IAM is unavailable", async () => {
    const { queries, commands, coordinator } = dependencies();
    queries.verifyAccessToken.mockResolvedValue("unauthenticated");
    commands.refreshSession.mockRejectedValue(new IamApiError("Unavailable", 503));
    const service = new IamSessionQueryServiceImpl(queries, commands, coordinator);

    await expect(
      service.resolveSession({ accessToken: "expired", refreshToken: "refresh" }),
    ).resolves.toEqual({ status: "unavailable" });
  });

  it("treats malformed IAM responses as unavailable instead of invalid sessions", async () => {
    const { queries, commands, coordinator } = dependencies();
    queries.verifyAccessToken.mockResolvedValue("unauthenticated");
    commands.refreshSession.mockRejectedValue(new Error("Malformed response"));
    const service = new IamSessionQueryServiceImpl(queries, commands, coordinator);

    await expect(
      service.resolveSession({ accessToken: "expired", refreshToken: "refresh" }),
    ).resolves.toEqual({ status: "unavailable" });
  });
});
