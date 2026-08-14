/** @vitest-environment jsdom */
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SidebarProfile } from "@/contexts/profiles/interfaces/components/profile/sidebar-profile";

const profile = { username: "mateo", imageUrl: null };

describe("SidebarProfile", () => {
  it("should render the username on a trigger that announces a menu", () => {
    render(<SidebarProfile profile={profile} settingsHref="/settings" />);

    const trigger = screen.getByRole("button", { name: /mateo/i });
    expect(trigger).toBeVisible();
    expect(trigger).toHaveAttribute("aria-haspopup", "menu");
  });

  it("should fall back to a generic label when there is no profile", () => {
    render(<SidebarProfile profile={null} settingsHref="/settings" />);

    expect(screen.getByRole("button", { name: /profile/i })).toBeVisible();
  });

  it("should keep the menu closed until the trigger is clicked", () => {
    render(<SidebarProfile profile={profile} settingsHref="/settings" />);

    expect(screen.queryByRole("menuitem", { name: "Settings" })).toBeNull();
  });

  // The menu body lives in a portal, so a context misuse inside it is invisible
  // to the type checker and to the build. Only opening the menu proves it works.
  it("should open a menu with Settings and Upgrade plan when clicked", async () => {
    const user = userEvent.setup();
    render(
      <SidebarProfile profile={profile} settingsHref="/settings?establishmentId=abc" />
    );

    await user.click(screen.getByRole("button", { name: /mateo/i }));

    // The popup mounts into a portal a tick later, so this must be awaited.
    expect(await screen.findByRole("menuitem", { name: "Settings" })).toHaveAttribute(
      "href",
      "/settings?establishmentId=abc"
    );
    expect(screen.getByRole("menuitem", { name: "Upgrade plan" })).toHaveAttribute(
      "href",
      "/upgrade"
    );
  });

  it("should list only Settings, Upgrade plan and Invoices, without an account header", async () => {
    const user = userEvent.setup();
    render(<SidebarProfile profile={profile} settingsHref="/settings" />);

    await user.click(screen.getByRole("button", { name: /mateo/i }));
    await screen.findByRole("menu");

    expect(screen.getAllByRole("menuitem").map((item) => item.textContent)).toEqual([
      "Settings",
      "Upgrade plan",
      "Invoices",
    ]);
    // The username belongs to the trigger only; it must not repeat in the menu.
    expect(screen.getByRole("menu")).not.toHaveTextContent("mateo");
  });

  it("should point Upgrade plan at a caller-supplied route", async () => {
    const user = userEvent.setup();
    render(
      <SidebarProfile profile={profile} settingsHref="/settings" upgradeHref="/billing" />
    );

    await user.click(screen.getByRole("button", { name: /mateo/i }));

    expect(await screen.findByRole("menuitem", { name: "Upgrade plan" })).toHaveAttribute(
      "href",
      "/billing"
    );
  });
});
