/** @vitest-environment jsdom */
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { VerifyForm } from "@/contexts/iam/interfaces/components/verify-form";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock("@/contexts/iam/interfaces/actions/confirm-email-sign-in.action", () => ({ confirmEmailSignInAction: vi.fn() }));
vi.mock("@/contexts/iam/interfaces/actions/resend-email-sign-in.action", () => ({ resendEmailSignInAction: vi.fn() }));

describe("VerifyForm", () => {
  it("should render the email and six accessible verification inputs", () => {
    render(<VerifyForm email="user@example.com" />);
    expect(screen.getByRole("heading", { name: "Check your email" })).toBeVisible();
    expect(screen.getByText("user@example.com")).toBeVisible();
    expect(screen.getAllByRole("textbox")).toHaveLength(6);
  });

  it("should display the initial error when the sign-in link is invalid", () => {
    render(<VerifyForm email="user@example.com" initialError="Invalid link" />);
    expect(screen.getByRole("alert")).toHaveTextContent("Invalid link");
  });

  it("should focus the next digit when a verification digit is entered", async () => {
    const user = userEvent.setup();
    render(<VerifyForm email="user@example.com" />);
    const first = screen.getByRole("textbox", { name: "Verification digit 1" });
    const second = screen.getByRole("textbox", { name: "Verification digit 2" });
    await user.type(first, "1");
    expect(second).toHaveFocus();
  });

  it("should distribute pasted digits across the verification inputs", async () => {
    // Arrange
    const user = userEvent.setup();
    render(<VerifyForm email="user@example.com" />);
    const first = screen.getByRole("textbox", { name: "Verification digit 1" });

    // Act
    await user.click(first);
    await user.paste("12a3456");

    // Assert
    expect(first).toHaveValue("1");
    expect(screen.getByRole("textbox", { name: "Verification digit 2" })).toHaveValue("2");
    expect(screen.getByRole("textbox", { name: "Verification digit 6" })).toHaveValue("6");
  });

  it("should move focus backwards when backspace is pressed on an empty digit", async () => {
    // Arrange
    const user = userEvent.setup();
    render(<VerifyForm email="user@example.com" />);
    const first = screen.getByRole("textbox", { name: "Verification digit 1" });
    const second = screen.getByRole("textbox", { name: "Verification digit 2" });

    // Act
    await user.click(second);
    await user.keyboard("{Backspace}");

    // Assert
    expect(first).toHaveFocus();
  });
});
