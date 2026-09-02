/** @vitest-environment jsdom */
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { fireEvent } from "@testing-library/react";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn() }),
}));
import { SidebarProfile } from "@/contexts/profiles/interfaces/components/profile/sidebar-profile";

const profile = { username: "mateo", imageUrl: null };

describe("SidebarProfile", () => {
  it("should render the username on a trigger that announces a menu", () => {
    render(<SidebarProfile profile={profile} profileHref="/profile" />);

    const trigger = screen.getByRole("button", { name: /mateo/i });
    expect(trigger).toBeVisible();
    expect(trigger).toHaveAttribute("aria-haspopup", "menu");
  });

  it("should show the user fallback when the profile image fails", () => {
    const { container } = render(
      <SidebarProfile profile={{ username: "mateo", imageUrl: "https://picsum.photos/seed/replik-test/800/600" }} profileHref="/profile" />,
    );
    fireEvent.error(container.querySelector("img")!);
    expect(container.querySelector("img")).toBeNull();
    expect(container.querySelector("svg.lucide-user")).toBeInTheDocument();
  });

  it("should fall back to a generic label when there is no profile", () => {
    render(<SidebarProfile profile={null} profileHref="/profile" />);

    expect(screen.getByRole("button", { name: /profile/i })).toBeVisible();
  });

  it("should keep the menu closed until the trigger is clicked", () => {
    render(<SidebarProfile profile={profile} profileHref="/profile" />);

    expect(screen.queryByRole("menuitem", { name: "Profile" })).toBeNull();
  });

  it("should open a menu with Profile and Upgrade plan when clicked", async () => {
    const user = userEvent.setup();
    render(
      <SidebarProfile profile={profile} profileHref="/profile?establishmentId=abc" />
    );

    await user.click(screen.getByRole("button", { name: /mateo/i }));

    expect(await screen.findByRole("menuitem", { name: "Profile" })).toHaveAttribute(
      "href",
      "/profile?establishmentId=abc"
    );
    expect(screen.getByRole("menuitem", { name: "Upgrade plan" })).toHaveAttribute(
      "href",
      "/upgrade"
    );
  });

  it("should list Profile, billing links and logout, without an account header", async () => {
    const user = userEvent.setup();
    render(<SidebarProfile profile={profile} profileHref="/profile" />);

    await user.click(screen.getByRole("button", { name: /mateo/i }));
    await screen.findByRole("menu");

    expect(screen.getAllByRole("menuitem").map((item) => item.textContent)).toEqual([
      "Profile",
      "Upgrade plan",
      "Invoices",
      "Log out",
    ]);
    expect(screen.getByRole("menu")).not.toHaveTextContent("mateo");
  });

  it("should point Upgrade plan at a caller-supplied route", async () => {
    const user = userEvent.setup();
    render(
      <SidebarProfile profile={profile} profileHref="/profile" upgradeHref="/billing" />
    );

    await user.click(screen.getByRole("button", { name: /mateo/i }));

    expect(await screen.findByRole("menuitem", { name: "Upgrade plan" })).toHaveAttribute(
      "href",
      "/billing"
    );
  });

  it("should hide billing links when the account cannot manage billing", async () => {
    const user = userEvent.setup();
    render(<SidebarProfile profile={profile} profileHref="/profile" canManageBilling={false} />);

    await user.click(screen.getByRole("button", { name: /mateo/i }));

    expect(await screen.findByRole("menuitem", { name: "Profile" })).toHaveAttribute(
      "href",
      "/profile"
    );
    expect(screen.queryByRole("menuitem", { name: "Upgrade plan" })).toBeNull();
    expect(screen.queryByRole("menuitem", { name: "Invoices" })).toBeNull();
    expect(screen.getByRole("menuitem", { name: "Log out" })).toBeVisible();
  });

  it("should synchronize username and photo when profile prop updates", () => {
    const { rerender, container } = render(
      <SidebarProfile profile={{ username: "mateo", imageUrl: null }} profileHref="/profile" />
    );

    expect(screen.getByRole("button", { name: /mateo/i })).toBeVisible();
    expect(container.querySelector("img")).toBeNull();

    rerender(
      <SidebarProfile
        profile={{ username: "carlos", imageUrl: "https://picsum.photos/seed/replik-test/800/600" }}
        profileHref="/profile"
      />
    );

    expect(screen.getByRole("button", { name: /carlos/i })).toBeVisible();
    const img = container.querySelector("img");
    expect(img).not.toBeNull();
    expect(img).toHaveAttribute("src", "https://picsum.photos/seed/replik-test/800/600");
  });

  it("should render the Lucide User icon inside avatar fallback when profile imageUrl is null", () => {
    const { container } = render(
      <SidebarProfile profile={{ username: "mateo", imageUrl: null }} profileHref="/profile" />
    );

    const fallbackSvg = container.querySelector("svg.lucide-user");
    expect(fallbackSvg).toBeInTheDocument();
  });
});
