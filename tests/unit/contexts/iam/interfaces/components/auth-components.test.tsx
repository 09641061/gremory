/** @vitest-environment jsdom */
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AuthForm } from "@/contexts/iam/interfaces/components/auth-form";
import { LogoutButton } from "@/contexts/iam/interfaces/components/logout-button";
import { AuthCallback } from "@/contexts/iam/interfaces/components/auth-callback";

const mocks = vi.hoisted(() => ({
  router: { push: vi.fn(), replace: vi.fn() },
  signOut: vi.fn(),
}));

vi.mock("next/navigation", () => ({ useRouter: () => mocks.router }));
vi.mock("@/contexts/iam/interfaces/actions/request-email-sign-in.action", () => ({
  requestEmailSignInAction: vi.fn(),
}));
vi.mock("@/contexts/iam/interfaces/actions/start-google-auth.action", () => ({
  startGoogleAuthAction: vi.fn(),
}));
vi.mock("@/contexts/iam/interfaces/actions/sign-out.action", () => ({
  signOutAction: () => mocks.signOut(),
}));

describe("IAM client components", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.signOut.mockResolvedValue({ status: "success", error: null });
  });

  it("should render the email sign-in controls when the auth form is idle", () => {
    // Arrange / Act
    render(<AuthForm />);

    // Assert
    expect(screen.getByRole("heading", { name: "Continue to Takodu" })).toBeVisible();
    expect(screen.getByRole("textbox", { name: "Email address" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Continue with Google" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Continue with email" })).toBeEnabled();
  });

  it("should navigate to login when sign-out succeeds", async () => {
    // Arrange
    const user = userEvent.setup();
    render(<LogoutButton />);

    // Act
    await user.click(screen.getByRole("button", { name: "Log out" }));

    // Assert
    await waitFor(() => expect(mocks.router.replace).toHaveBeenCalledWith("/login"));
  });

  it("should display an error when sign-out fails", async () => {
    // Arrange
    mocks.signOut.mockResolvedValue({ status: "error", error: "Unable to sign out" });
    const user = userEvent.setup();
    render(<LogoutButton />);

    // Act
    await user.click(screen.getByRole("button", { name: "Log out" }));

    // Assert
    expect(await screen.findByText("Unable to sign out")).toBeVisible();
    expect(mocks.router.replace).not.toHaveBeenCalled();
  });

  it("should persist callback tokens and let the proxy decide the destination", async () => {
    // Arrange
    window.location.hash = "#access_token=a&refresh_token=r";
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(null, { status: 204 }));
    vi.stubGlobal("fetch", fetchMock);

    // Act
    render(<AuthCallback />);

    // Assert
    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith(
      "/api/iam/auth/session",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ accessToken: "a", refreshToken: "r" }),
      })
    ));
    await waitFor(() => expect(mocks.router.replace).toHaveBeenCalledWith("/chat"));
  });

  it("should return to the invitation after authentication", async () => {
    // Arrange
    window.location.hash = "#access_token=a&refresh_token=r";
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: 204 })));

    // Act
    render(<AuthCallback returnTo="/invitations/accept?token=raw-token" />);

    // Assert
    await waitFor(() =>
      expect(mocks.router.replace).toHaveBeenCalledWith(
        "/invitations/accept?token=raw-token",
      ),
    );
  });

  it("should navigate home when the callback hash does not contain tokens", async () => {
    // Arrange
    window.location.hash = "";

    // Act
    render(<AuthCallback />);

    // Assert
    await waitFor(() => expect(mocks.router.replace).toHaveBeenCalledWith("/"));
  });
});
