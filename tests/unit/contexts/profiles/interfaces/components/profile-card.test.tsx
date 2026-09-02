/** @vitest-environment jsdom */
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProfileCard } from "@/contexts/profiles/interfaces/components/profile/profile-card";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

const profile = {
  username: "mateo",
  imageUrl: "https://example.com/mateo.jpg",
  language: "ES" as const,
  theme: "SYSTEM" as const,
};

describe("ProfileCard", () => {
  it("should render the profile photo and username fields with counter and instructions", () => {
    render(<ProfileCard profile={profile} />);

    expect(screen.getByRole("heading", { name: "Profile photo" })).toBeVisible();
    expect(screen.getByRole("heading", { name: "Username" })).toBeVisible();
    expect(screen.getByRole("textbox", { name: "Username" })).toHaveValue("mateo");
    expect(screen.getByText("5/20")).toBeVisible();
    expect(
      screen.getByText("Only letters (A-Z, a-z), 3 to 20 characters.")
    ).toBeVisible();
    expect(screen.getByLabelText("Upload image")).toHaveAttribute("name", "imageFile");
    expect(screen.getByRole("img", { name: "mateo" })).toHaveAttribute(
      "src",
      "https://example.com/mateo.jpg",
    );
  });

  it("should filter out non-letter characters immediately when typing", async () => {
    const user = userEvent.setup();
    render(<ProfileCard profile={profile} />);

    const input = screen.getByRole("textbox", { name: "Username" });
    await user.clear(input);
    await user.type(input, "Mateo123!_ ñ");

    expect(input).toHaveValue("Mateo");
  });

  it("should truncate input exceeding the maximum length of 20 characters", async () => {
    const user = userEvent.setup();
    render(<ProfileCard profile={profile} />);

    const input = screen.getByRole("textbox", { name: "Username" });
    await user.clear(input);
    await user.type(input, "abcdefghijklmnopqrstuvwxyz");

    expect(input).toHaveValue("abcdefghijklmnopqrst");
    expect(screen.getByText("20/20")).toBeVisible();
  });

  it("should show an inline error message and disable save button when username is less than 3 characters", async () => {
    const user = userEvent.setup();
    render(<ProfileCard profile={profile} />);

    const input = screen.getByRole("textbox", { name: "Username" });
    await user.clear(input);
    await user.type(input, "ab");

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Username must be at least 3 characters."
    );
    expect(screen.getByRole("button", { name: "Save" })).toBeDisabled();
  });

  it("should reset username to original value when Cancel is clicked", async () => {
    const user = userEvent.setup();
    render(<ProfileCard profile={profile} />);

    const input = screen.getByRole("textbox", { name: "Username" });
    await user.clear(input);
    await user.type(input, "Carlos");

    expect(input).toHaveValue("Carlos");
    const cancelButton = screen.getByRole("button", { name: "Cancel" });
    await user.click(cancelButton);

    expect(input).toHaveValue("mateo");
  });
});

