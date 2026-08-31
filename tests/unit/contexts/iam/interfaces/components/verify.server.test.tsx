import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { Verify } from "@/contexts/iam/interfaces/components/verify";

const mocks = vi.hoisted(() => ({
  service: { verifyMagicLink: vi.fn() },
  cookieStore: { get: vi.fn() },
}));

vi.mock("next/navigation", () => ({ redirect: vi.fn() }));
vi.mock("next/headers", () => ({ cookies: vi.fn(() => mocks.cookieStore) }));
vi.mock("@/contexts/iam/application/internal/commandservices/iam-authentication-command.service", () => ({
  createIamAuthenticationCommandService: () => mocks.service,
}));

describe("Verify server component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.cookieStore.get.mockReturnValue(undefined);
  });

  it("should redirect to login when email and token are missing", async () => {
    // Act
    await Verify({ searchParams: Promise.resolve({}) });

    // Assert
    expect(redirect).toHaveBeenCalledWith("/login");
  });

  it("should verify a magic link and redirect to the callback when the token is valid", async () => {
    // Arrange
    mocks.service.verifyMagicLink.mockResolvedValue({ accessToken: "a", refreshToken: "r" });

    // Act
    await Verify({ searchParams: Promise.resolve({ token: "magic-token" }) });

    // Assert
    expect(mocks.service.verifyMagicLink).toHaveBeenCalledWith({ token: "magic-token" });
    expect(redirect).toHaveBeenCalledWith("/auth/callback#access_token=a&refresh_token=r");
  });

  it("should render the verification form with an error when magic-link verification fails", async () => {
    // Arrange
    mocks.service.verifyMagicLink.mockRejectedValue(new Error("Expired"));
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

    // Act
    const result = await Verify({ searchParams: Promise.resolve({ email: "user@example.com", token: "expired" }) });

    // Assert
    expect(result).toBeTruthy();
    expect(redirect).not.toHaveBeenCalled();
    expect(consoleError).toHaveBeenCalled();
    consoleError.mockRestore();
  });

  it("should use the pending cookie email when the route has no email parameter", async () => {
    // Arrange
    mocks.cookieStore.get.mockReturnValue({ value: "pending@example.com" });

    // Act
    const result = await Verify({ searchParams: Promise.resolve({}) });

    // Assert
    expect(cookies).toHaveBeenCalled();
    expect(result).toBeTruthy();
  });
});
