const mocks = vi.hoisted(() => ({
  cookies: { get: vi.fn(), set: vi.fn(), delete: vi.fn() },
  service: { requestEmailSignIn: vi.fn(), confirmEmailSignIn: vi.fn(), signOut: vi.fn() },
}));

vi.mock("next/navigation", () => ({ redirect: vi.fn() }));
vi.mock("next/headers", () => ({ cookies: vi.fn(() => mocks.cookies) }));
vi.mock("@/contexts/iam/application/internal/commandservices/iam-authentication-command.service", () => ({
  createIamAuthenticationCommandService: () => mocks.service,
}));

import { redirect } from "next/navigation";
import { iamSessionCookies } from "@/contexts/iam/infrastructure/session/iam-session-cookie";
import { requestEmailSignInAction } from "@/contexts/iam/interfaces/actions/request-email-sign-in.action";
import { resendEmailSignInAction } from "@/contexts/iam/interfaces/actions/resend-email-sign-in.action";
import { confirmEmailSignInAction } from "@/contexts/iam/interfaces/actions/confirm-email-sign-in.action";
import { signOutAction } from "@/contexts/iam/interfaces/actions/sign-out.action";
import { startGoogleAuthAction } from "@/contexts/iam/interfaces/actions/start-google-auth.action";

function form(values: Record<string, string>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(values)) data.append(key, value);
  return data;
}

describe("IAM Server Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    mocks.cookies.get.mockReturnValue(undefined);
    mocks.service.requestEmailSignIn.mockResolvedValue(undefined);
    mocks.service.confirmEmailSignIn.mockResolvedValue({ accessToken: "a", refreshToken: "r", expiresIn: 3600 });
    mocks.service.signOut.mockResolvedValue(undefined);
  });

  it("should return a validation error and skip the service when email is invalid", async () => {
    // Act
    const result = await requestEmailSignInAction({ status: "idle", error: null }, form({ email: "invalid" }));
    // Assert
    expect(result.status).toBe("error");
    expect(mocks.service.requestEmailSignIn).not.toHaveBeenCalled();
  });

  it("should persist the pending email and redirect when sign-in succeeds", async () => {
    // Act
    await requestEmailSignInAction({ status: "idle", error: null }, form({ email: "user@example.com" }));
    // Assert
    expect(mocks.cookies.set).toHaveBeenCalledWith(iamSessionCookies.pendingEmail, "user@example.com", expect.objectContaining({ maxAge: 600 }));
    expect(redirect).toHaveBeenCalledWith("/auth/verify?email=user%40example.com");
  });

  it("should return success when resending a valid sign-in email", async () => {
    // Act
    const result = await resendEmailSignInAction({ status: "idle", error: null }, form({ email: "user@example.com" }));
    // Assert
    expect(result).toEqual({ status: "success", error: null });
  });

  it("should confirm the code, clear the pending email, and redirect when code is valid", async () => {
    // Act
    await confirmEmailSignInAction({ status: "idle", error: null }, form({ email: "user@example.com", code: "123456" }));
    // Assert
    expect(mocks.cookies.delete).toHaveBeenCalledWith(iamSessionCookies.pendingEmail);
    expect(redirect).toHaveBeenCalledWith("/auth/callback#access_token=a&refresh_token=r&expires_in=3600");
  });

  it("should return a missing-token error and skip the service when no session exists", async () => {
    // Act
    const result = await signOutAction();
    // Assert
    expect(result).toEqual({ status: "error", error: "Authentication tokens are missing" });
    expect(mocks.service.signOut).not.toHaveBeenCalled();
  });

  it("should clear session cookies when sign-out succeeds", async () => {
    // Arrange
    mocks.cookies.get.mockReturnValueOnce({ value: "a" }).mockReturnValueOnce({ value: "r" });
    // Act
    const result = await signOutAction();
    // Assert
    expect(result).toEqual({ status: "success", error: null });
    expect(mocks.service.signOut).toHaveBeenCalledWith({ accessToken: "a", refreshToken: "r" });
  });

  it("should return an error when requesting sign-in fails in the application service", async () => {
    // Arrange
    mocks.service.requestEmailSignIn.mockRejectedValue(new Error("API unavailable"));

    // Act
    const result = await requestEmailSignInAction(
      { status: "idle", error: null },
      form({ email: "user@example.com" })
    );

    // Assert
    expect(result.status).toBe("error");
    expect(mocks.cookies.set).not.toHaveBeenCalled();
    expect(redirect).not.toHaveBeenCalled();
  });

  it("should return an error when resending the email fails in the application service", async () => {
    // Arrange
    mocks.service.requestEmailSignIn.mockRejectedValue(new Error("API unavailable"));

    // Act
    const result = await resendEmailSignInAction(
      { status: "idle", error: null },
      form({ email: "user@example.com" })
    );

    // Assert
    expect(result).toEqual({
      status: "error",
      error: "Unable to resend the sign-in email. Please try again.",
    });
  });

  it("should return an error and preserve cookies when code confirmation fails", async () => {
    // Arrange
    mocks.service.confirmEmailSignIn.mockRejectedValue(new Error("Invalid code"));

    // Act
    const result = await confirmEmailSignInAction(
      { status: "idle", error: null },
      form({ email: "user@example.com", code: "123456" })
    );

    // Assert
    expect(result).toEqual({
      status: "error",
      error: "Unable to verify the code. Check it and try again.",
    });
    expect(mocks.cookies.delete).not.toHaveBeenCalled();
  });

  it("should return an error and keep cookies when sign-out fails", async () => {
    // Arrange
    mocks.cookies.get.mockReturnValueOnce({ value: "a" }).mockReturnValueOnce({ value: "r" });
    mocks.service.signOut.mockRejectedValue(new Error("API unavailable"));

    // Act
    const result = await signOutAction();

    // Assert
    expect(result).toEqual({ status: "error", error: "Unable to sign out. Please try again." });
    expect(mocks.cookies.delete).not.toHaveBeenCalled();
  });

  it("should redirect to the Google authorization endpoint", async () => {
    // Act
    await startGoogleAuthAction();

    // Assert
    expect(redirect).toHaveBeenCalledWith(
      "http://localhost:8080/api/v1/auth/google/authorize"
    );
  });
});
