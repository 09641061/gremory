/** @vitest-environment jsdom */
import { render, screen } from "@testing-library/react";
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
  it("should render the profile photo and username fields", () => {
    render(<ProfileCard profile={profile} />);

    expect(screen.getByRole("heading", { name: "Profile photo" })).toBeVisible();
    expect(screen.getByRole("heading", { name: "Username" })).toBeVisible();
    expect(screen.getByRole("textbox", { name: "Username" })).toHaveValue("mateo");
    expect(screen.getByLabelText("Upload image")).toHaveAttribute("name", "imageFile");
    expect(screen.getByRole("img", { name: "mateo" })).toHaveAttribute(
      "src",
      "https://example.com/mateo.jpg",
    );
  });
});
