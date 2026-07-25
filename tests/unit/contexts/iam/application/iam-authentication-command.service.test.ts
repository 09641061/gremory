import { createEmail } from "@/contexts/iam/domain/model/valueobjects/email";
import { IamAuthenticationCommandServiceImpl } from "@/contexts/iam/application/internal/commandservices/iam-authentication-command.service";

describe("IamAuthenticationCommandServiceImpl", () => {
  it("should delegate email sign-in when the command is valid", async () => {
    // Arrange
    const gateway = {
      requestEmailSignIn: vi.fn().mockResolvedValue(undefined),
      confirmEmailSignIn: vi.fn(), refreshSession: vi.fn(), signOut: vi.fn(), verifyMagicLink: vi.fn(),
    };
    const service = new IamAuthenticationCommandServiceImpl(gateway);
    const command = { email: createEmail("user@example.com") };
    // Act
    await service.requestEmailSignIn(command);
    // Assert
    expect(gateway.requestEmailSignIn).toHaveBeenCalledWith(command);
  });

  it("should return the gateway session when confirmation succeeds", async () => {
    // Arrange
    const session = { accessToken: "a", refreshToken: "r" };
    const gateway = {
      requestEmailSignIn: vi.fn(), confirmEmailSignIn: vi.fn().mockResolvedValue(session),
      refreshSession: vi.fn(), signOut: vi.fn(), verifyMagicLink: vi.fn(),
    };
    const service = new IamAuthenticationCommandServiceImpl(gateway);
    const command = { email: createEmail("user@example.com"), code: "123456" };
    // Act
    const result = await service.confirmEmailSignIn(command);
    // Assert
    expect(result).toEqual(session);
    expect(gateway.confirmEmailSignIn).toHaveBeenCalledWith(command);
  });

  it("should propagate a gateway error when sign-out fails", async () => {
    // Arrange
    const gateway = {
      requestEmailSignIn: vi.fn(), confirmEmailSignIn: vi.fn(),
      refreshSession: vi.fn(), signOut: vi.fn().mockRejectedValue(new Error("Gateway unavailable")), verifyMagicLink: vi.fn(),
    };
    const service = new IamAuthenticationCommandServiceImpl(gateway);
    // Act / Assert
    await expect(service.signOut({ accessToken: "a", refreshToken: "r" }))
      .rejects.toThrow("Gateway unavailable");
  });

  it("should delegate magic-link verification when the token is valid", async () => {
    // Arrange
    const session = { accessToken: "a", refreshToken: "r" };
    const gateway = {
      requestEmailSignIn: vi.fn(), confirmEmailSignIn: vi.fn(), signOut: vi.fn(),
      refreshSession: vi.fn(), verifyMagicLink: vi.fn().mockResolvedValue(session),
    };
    const service = new IamAuthenticationCommandServiceImpl(gateway);

    // Act
    const result = await service.verifyMagicLink({ token: "magic-token" });

    // Assert
    expect(result).toEqual(session);
    expect(gateway.verifyMagicLink).toHaveBeenCalledWith({ token: "magic-token" });
  });

  it("should return the refreshed session when the refresh token is valid", async () => {
    // Arrange
    const session = { accessToken: "new-access", refreshToken: "new-refresh" };
    const gateway = {
      requestEmailSignIn: vi.fn(), confirmEmailSignIn: vi.fn(),
      refreshSession: vi.fn().mockResolvedValue(session), signOut: vi.fn(), verifyMagicLink: vi.fn(),
    };
    const service = new IamAuthenticationCommandServiceImpl(gateway);
    const command = { refreshToken: "refresh-token" };

    // Act
    const result = await service.refreshSession(command);

    // Assert
    expect(result).toEqual(session);
    expect(gateway.refreshSession).toHaveBeenCalledWith(command);
  });
});
