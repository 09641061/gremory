/** @vitest-environment jsdom */
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ErrorBanner } from "@/contexts/shared/interfaces/components/error-banner";

const mockGet = vi.fn().mockReturnValueOnce("org").mockReturnValue(null);
const mockReplace = vi.fn();
vi.mock("next/navigation", () => ({
  useSearchParams: () => ({
    get: mockGet,
  }),
  useRouter: () => ({
    replace: mockReplace,
  }),
  usePathname: () => "/chat",
}));

describe("ErrorBanner Component", () => {
  it("renders the translated error message and allows dismissing it", async () => {
    render(<ErrorBanner />);

    // Verify error banner content has been translated from "org" parameter
    expect(screen.getByText("Access Denied")).toBeDefined();
    expect(screen.getByText("You do not have permission to access organization details. Please contact your administrator.")).toBeDefined();

    // Verify next.js replace was called to clean the URL
    expect(mockReplace).toHaveBeenCalledWith("/chat");

    // Dismiss it
    const dismissButton = screen.getByRole("button", { name: "Dismiss alert" });
    fireEvent.click(dismissButton);

    // Verify it is removed asynchronously
    await waitFor(() => {
      expect(screen.queryByText("You do not have permission to access organization details. Please contact your administrator.")).toBeNull();
    });
  });
});
