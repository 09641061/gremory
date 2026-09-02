/** @vitest-environment jsdom */
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const mocks = vi.hoisted(() => ({
  replace: vi.fn(),
  signOutAction: vi.fn().mockResolvedValue({ status: "success" }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mocks.replace }),
}));
vi.mock("@/contexts/iam/interfaces/actions/sign-out.action", () => ({
  signOutAction: mocks.signOutAction,
}));
import { SidebarProfile } from "@/contexts/profiles/interfaces/components/profile/sidebar-profile";

const profile = { username: "user", imageUrl: null };

describe("SidebarProfile", () => {
  beforeEach(() => {
    mocks.replace.mockReset();
    mocks.signOutAction.mockReset();
    mocks.signOutAction.mockResolvedValue({ status: "success" });
  });

  it("should render the username on a trigger that announces a menu", () => {
    render(<SidebarProfile profile={profile} profileHref="/profile" />);

    const trigger = screen.getByRole("button", { name: /user/i });
    expect(trigger).toBeVisible();
    expect(trigger).toHaveAttribute("aria-haspopup", "menu");
    expect(trigger).toHaveAttribute("data-slot", "dropdown-menu-trigger");
  });

  it("should keep the menu closed until the trigger is clicked", () => {
    render(<SidebarProfile profile={profile} profileHref="/profile" />);

    expect(screen.queryByRole("menuitem", { name: "Profile" })).toBeNull();
  });

  it("should open a menu with Profile and Upgrade plan when clicked", async () => {
    const user = userEvent.setup();
    render(
      <SidebarProfile profile={profile} profileHref="/profile?establishmentId=abc" />,
    );

    await user.click(screen.getByRole("button", { name: /user/i }));

    expect(await screen.findByRole("menuitem", { name: "Profile" })).toHaveAttribute(
      "href",
      "/profile?establishmentId=abc",
    );
    expect(screen.getByRole("menuitem", { name: "Upgrade plan" })).toHaveAttribute(
      "href",
      "/upgrade",
    );
  });

  it("should list Profile, billing links and logout, without an account header", async () => {
    const user = userEvent.setup();
    render(<SidebarProfile profile={profile} profileHref="/profile" />);

    await user.click(screen.getByRole("button", { name: /user/i }));
    await screen.findByRole("menu");

    expect(screen.getAllByRole("menuitem").map((item) => item.textContent)).toEqual([
      "Profile",
      "Upgrade plan",
      "Invoices",
      "Log out",
    ]);
    expect(screen.getByRole("menu")).not.toHaveTextContent("user");
  });

  it("should point Upgrade plan at a caller-supplied route", async () => {
    const user = userEvent.setup();
    render(
      <SidebarProfile profile={profile} profileHref="/profile" upgradeHref="/billing" />,
    );

    await user.click(screen.getByRole("button", { name: /user/i }));

    expect(await screen.findByRole("menuitem", { name: "Upgrade plan" })).toHaveAttribute(
      "href",
      "/billing",
    );
  });

  it("should hide billing links when the account cannot manage billing", async () => {
    const user = userEvent.setup();
    render(<SidebarProfile profile={profile} profileHref="/profile" canManageBilling={false} />);

    await user.click(screen.getByRole("button", { name: /user/i }));

    expect(await screen.findByRole("menuitem", { name: "Profile" })).toHaveAttribute(
      "href",
      "/profile",
    );
    expect(screen.queryByRole("menuitem", { name: "Upgrade plan" })).toBeNull();
    expect(screen.queryByRole("menuitem", { name: "Invoices" })).toBeNull();
    expect(screen.getByRole("menuitem", { name: "Log out" })).toBeVisible();
  });

  it("should sign out and redirect to login when Log out is clicked", async () => {
    const user = userEvent.setup();
    render(<SidebarProfile profile={profile} profileHref="/profile" />);

    await user.click(screen.getByRole("button", { name: /user/i }));
    const logoutItem = await screen.findByRole("menuitem", { name: "Log out" });
    await user.click(logoutItem);

    expect(mocks.signOutAction).toHaveBeenCalled();
    expect(mocks.replace).toHaveBeenCalledWith("/login");
  });

  it("should keep the avatar fallback visible when there is no image", () => {
    const { container } = render(<SidebarProfile profile={profile} profileHref="/profile" />);

    expect(container.querySelector("svg.lucide-user")).toBeInTheDocument();
  });

  it("should update the visible username when profile prop changes", () => {
    const { rerender } = render(
      <SidebarProfile profile={{ username: "user", imageUrl: null }} profileHref="/profile" />,
    );

    expect(screen.getByRole("button", { name: /user/i })).toBeVisible();

    rerender(
      <SidebarProfile profile={{ username: "carlos", imageUrl: null }} profileHref="/profile" />,
    );

    expect(screen.getByRole("button", { name: /carlos/i })).toBeVisible();
  });
});
