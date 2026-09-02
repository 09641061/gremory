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

function renderSidebarProfile(overrides: Partial<React.ComponentProps<typeof SidebarProfile>> = {}) {
  return render(<SidebarProfile profile={profile} profileHref="/profile" {...overrides} />);
}

describe("SidebarProfile", () => {
  beforeEach(() => {
    mocks.replace.mockReset();
    mocks.signOutAction.mockReset();
    mocks.signOutAction.mockResolvedValue({ status: "success" });
  });

  it("should render the username in a button that announces a menu", () => {
    renderSidebarProfile();

    const trigger = screen.getByRole("button", { name: /user/i });
    expect(trigger).toBeVisible();
    expect(trigger).toHaveAttribute("aria-haspopup", "menu");
    expect(trigger).toHaveAttribute("data-slot", "dropdown-menu-trigger");
  });

  it("should keep the menu closed before the trigger is clicked", () => {
    renderSidebarProfile();

    expect(screen.queryByRole("menu")).toBeNull();
    expect(screen.queryByRole("menuitem", { name: "Profile" })).toBeNull();
  });

  it("should open profile and billing links when the trigger is clicked", async () => {
    const user = userEvent.setup();
    renderSidebarProfile({ profileHref: "/profile?establishmentId=abc" });

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

  it("should list billing links and log out without an account header", async () => {
    const user = userEvent.setup();
    renderSidebarProfile();

    await user.click(screen.getByRole("button", { name: /user/i }));
    const menu = await screen.findByRole("menu");

    expect(screen.getAllByRole("menuitem").map((item) => item.textContent)).toEqual([
      "Profile",
      "Upgrade plan",
      "Invoices",
      "Log out",
    ]);
    expect(menu).not.toHaveTextContent("user");
  });

  it("should point the upgrade link at a caller-supplied route", async () => {
    const user = userEvent.setup();
    renderSidebarProfile({ upgradeHref: "/billing" });

    await user.click(screen.getByRole("button", { name: /user/i }));

    expect(await screen.findByRole("menuitem", { name: "Upgrade plan" })).toHaveAttribute(
      "href",
      "/billing",
    );
  });

  it("should hide billing links when the account cannot manage billing", async () => {
    const user = userEvent.setup();
    renderSidebarProfile({ canManageBilling: false });

    await user.click(screen.getByRole("button", { name: /user/i }));

    expect(await screen.findByRole("menuitem", { name: "Profile" })).toHaveAttribute(
      "href",
      "/profile",
    );
    expect(screen.queryByRole("menuitem", { name: "Upgrade plan" })).toBeNull();
    expect(screen.queryByRole("menuitem", { name: "Invoices" })).toBeNull();
    expect(screen.getByRole("menuitem", { name: "Log out" })).toBeVisible();
  });

  it("should sign out and redirect to the login page when Log out is clicked", async () => {
    const user = userEvent.setup();
    renderSidebarProfile();

    await user.click(screen.getByRole("button", { name: /user/i }));
    await user.click(await screen.findByRole("menuitem", { name: "Log out" }));

    expect(mocks.signOutAction).toHaveBeenCalledTimes(1);
    expect(mocks.replace).toHaveBeenCalledWith("/login");
  });

  it("should keep the avatar fallback visible when there is no image", () => {
    const { container } = renderSidebarProfile();

    expect(container.querySelector("svg.lucide-user")).toBeInTheDocument();
  });

  it("should update the visible username when the profile changes", () => {
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
