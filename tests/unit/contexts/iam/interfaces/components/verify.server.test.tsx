import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { Verify } from "@/contexts/iam/interfaces/components/verify";
import { readDiagnosticRing, ensureDiagnosticRing } from "@/contexts/shared/interfaces/observability/sanitize-error";

const mocks = vi.hoisted(() => ({
  writer: { verifyMagicLink: vi.fn() },
  cookieStore: { get: vi.fn() },
}));

vi.mock("next/navigation", () => ({ redirect: vi.fn() }));
vi.mock("next/headers", () => ({ cookies: vi.fn(() => mocks.cookieStore) }));
vi.mock("@/contexts/iam/interfaces/server/iam-composition", () => ({
  composeIamAdapters: () => ({ authenticationWriter: mocks.writer }),
}));

describe("Verify server component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.cookieStore.get.mockReturnValue(undefined);
    ensureDiagnosticRing();
    (globalThis as { __diag_ring__?: Array<Record<string, unknown>> }).__diag_ring__ = [];
  });

  it("should redirect to login when email and token are missing", async () => {
    // Act
    await Verify({ searchParams: Promise.resolve({}) });

    // Assert
    expect(redirect).toHaveBeenCalledWith("/login");
  });

  it("should verify a magic link and redirect to the callback when the token is valid", async () => {
    // Arrange
    mocks.writer.verifyMagicLink.mockResolvedValue({ accessToken: "a", refreshToken: "r" });

    // Act
    await Verify({ searchParams: Promise.resolve({ token: "magic-token" }) });

    // Assert
    expect(mocks.writer.verifyMagicLink).toHaveBeenCalledWith({ token: "magic-token" });
    expect(redirect).toHaveBeenCalledWith("/auth/callback#access_token=a&refresh_token=r");
  });

  it("should render the verification form with an error when magic-link verification fails", async () => {
    // Arrange
    mocks.writer.verifyMagicLink.mockRejectedValue(new Error("Expired"));
    // Act
    const result = await Verify({ searchParams: Promise.resolve({ email: "user@example.com", token: "expired" }) });

    // Assert
    expect(result).toBeTruthy();
    expect(redirect).not.toHaveBeenCalled();
    expect(readDiagnosticRing()).toEqual(
      expect.arrayContaining([expect.objectContaining({ event: "iam.verify" })]),
    );
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
