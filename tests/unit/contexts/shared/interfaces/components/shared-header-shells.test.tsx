/** @vitest-environment jsdom */
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { WorkspaceHeaderViewModel } from "@/contexts/business/application/model/business-workspace.view-models";

const mocks = vi.hoisted(() => ({ pathname: "/welcome", replace: vi.fn(), signOut: vi.fn(), sidebar: vi.fn(), homeHref: "/chat" }));
vi.mock("next/navigation", () => ({ usePathname: () => mocks.pathname, useSearchParams: () => new URLSearchParams("establishmentId=branch"), useRouter: () => ({ replace: mocks.replace }) }));
vi.mock("@/contexts/iam/interfaces/actions/sign-out.action", () => ({ signOutAction: mocks.signOut }));
vi.mock("@/contexts/notifications/interfaces/components/notification-dropdown", () => ({ NotificationDropdown: () => <button>Notifications</button> }));
vi.mock("@/contexts/shared/interfaces/components/header/app-header-server", () => ({ AppHeaderServer: () => <AppHeader profile={{ username: "Ada", imageUrl: null }} workspace={workspace} homeHref={mocks.homeHref} /> }));
vi.mock("@/contexts/shared/interfaces/components/sidebar/app-sidebar-shell-server", () => ({ AppShellSidebarServer: () => { mocks.sidebar(); return <aside>Navigation</aside>; } }));
import { AppHeader } from "@/contexts/shared/interfaces/components/header/app-header";
import WelcomeLayout from "@/app/(protected)/(welcome)/layout";
import ProtectedAppShell from "@/contexts/shared/interfaces/components/protected-app-shell";
const workspace = { establishments: [{ id: "branch" }], accessPolicy: { canManageBilling: false } } as WorkspaceHeaderViewModel;

beforeEach(() => {
  mocks.pathname = "/welcome";
  mocks.homeHref = "/chat";
  mocks.sidebar.mockClear();
  mocks.replace.mockClear();
  mocks.signOut.mockResolvedValue({ status: "success" });
  window.matchMedia = vi.fn().mockReturnValue({ addEventListener: vi.fn(), removeEventListener: vi.fn(), matches: false });
});

describe("shared account header and route shells", () => {
  it("should mount header and content but never sidebar or its provider on Welcome", () => {
    const { container } = render(<WelcomeLayout><h1>Welcome</h1></WelcomeLayout>);
    expect(screen.getAllByRole("banner")).toHaveLength(1);
    expect(within(screen.getByRole("main")).getByRole("heading", { name: "Welcome" })).toBeVisible();
    expect(mocks.sidebar).not.toHaveBeenCalled();
    expect(container.querySelector('[data-slot="sidebar-wrapper"]')).toBeNull();
    expect(screen.queryByRole("button", { name: "Toggle Sidebar" })).toBeNull();
  });

  it("should mount one header before sidebar and content and keep the mobile trigger on app routes", () => {
    mocks.pathname = "/chat";
    const { container } = render(<ProtectedAppShell><h1>Chat</h1></ProtectedAppShell>);
    expect(screen.getAllByRole("banner")).toHaveLength(1);
    expect(screen.getByRole("banner").compareDocumentPosition(screen.getByRole("complementary")) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(screen.getByRole("button", { name: "Toggle Sidebar" })).toHaveClass("md:hidden");
    expect(mocks.sidebar).toHaveBeenCalled();
    // Regression: the header <header> element is a sibling ABOVE
    // [data-slot="sidebar-wrapper"], not a descendant of the provider.
    // Guards against the layout-fix reverting to the flex-col workaround.
    const banner = screen.getByRole("banner");
    const sidebarWrapper = container.querySelector('[data-slot="sidebar-wrapper"]');
    expect(sidebarWrapper).not.toBeNull();
    expect(sidebarWrapper!.contains(banner)).toBe(false);
    expect(banner.compareDocumentPosition(sidebarWrapper!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("should preserve all prepaid account actions with notifications before Profile without a SidebarProvider", async () => {
    const user = userEvent.setup();
    render(<WelcomeLayout><h1>Welcome</h1></WelcomeLayout>);
    const buttons = within(screen.getByRole("banner")).getAllByRole("button");
    expect(buttons.map((button) => button.textContent)).toEqual(["Notifications", "Ada"]);
    await user.click(screen.getByRole("button", { name: "Ada" }));
    expect((await screen.findAllByRole("menuitem")).map((item) => item.textContent)).toEqual(["Profile", "Upgrade plan", "Invoices", "Log out"]);
    expect(screen.getByRole("menuitem", { name: "Invoices" })).toHaveAttribute("href", "/invoice?establishmentId=branch");
    expect(screen.getByRole("menuitem", { name: "Profile" })).toHaveAttribute("href", "/profile");
    expect(screen.getByRole("menuitem", { name: "Upgrade plan" })).toHaveAttribute("href", "/upgrade");
    await user.click(screen.getByRole("menuitem", { name: "Log out" }));
    expect(mocks.signOut).toHaveBeenCalled();
    expect(mocks.replace).toHaveBeenCalledWith("/login");
  });

  it("should preserve paid-owner billing actions using the existing access policy", async () => {
    mocks.pathname = "/chat";
    const user = userEvent.setup();
    render(<AppHeader profile={{ username: "Ada", imageUrl: null }} workspace={{ ...workspace, accessPolicy: { ...workspace.accessPolicy!, canManageBilling: true } }} homeHref="/chat" />);
    await user.click(screen.getByRole("button", { name: "Ada" }));
    expect(await screen.findByRole("menuitem", { name: "Upgrade plan" })).toHaveAttribute("href", "/upgrade");
    expect(screen.getByRole("menuitem", { name: "Invoices" })).toHaveAttribute("href", "/invoice?establishmentId=branch");
  });

  it("should keep member billing restrictions and keyboard menu operation", async () => {
    mocks.pathname = "/schedule";
    const user = userEvent.setup();
    render(<AppHeader profile={{ username: "Ada", imageUrl: null }} workspace={workspace} homeHref="/chat" />);
    screen.getByRole("button", { name: "Ada" }).focus();
    await user.keyboard("{Enter}");
    expect(await screen.findByRole("menuitem", { name: "Profile" })).toBeVisible();
    expect(screen.queryByRole("menuitem", { name: "Invoices" })).toBeNull();
    await user.keyboard("{Escape}");
    expect(screen.getByRole("button", { name: "Ada" })).toHaveFocus();
  });

  it("should expose the Takodu brand link in the header pointing at the server-resolved home", () => {
    mocks.pathname = "/chat";
    mocks.homeHref = "/chat";
    render(<AppHeader profile={{ username: "Ada", imageUrl: null }} workspace={workspace} homeHref={mocks.homeHref} />);
    const brandLink = screen.getByTestId("app-header-brand-link");
    expect(brandLink).toHaveAttribute("href", "/chat");
    expect(brandLink).toHaveAttribute("aria-label", "Takodu — go to home");
    // Brand is NOT counted as a button; the banner still owns only
    // notification + profile controls.
    expect(within(screen.getByRole("banner")).getAllByRole("button").map((b) => b.textContent)).toEqual([
      "Notifications",
      "Ada",
    ]);
  });

  it("should mark the brand link as aria-current=page only when the home matches the current pathname", () => {
    // When the user is already on the resolved home, the link is the active page.
    mocks.pathname = "/welcome";
    mocks.homeHref = "/welcome";
    const { rerender } = render(
      <AppHeader profile={{ username: "Ada", imageUrl: null }} workspace={workspace} homeHref="/welcome" />,
    );
    expect(screen.getByTestId("app-header-brand-link")).toHaveAttribute("aria-current", "page");

    // When the user is on a deep route (pathname differs from homeHref),
    // the brand link stays a plain link with no aria-current.
    mocks.pathname = "/chat";
    rerender(
      <AppHeader profile={{ username: "Ada", imageUrl: null }} workspace={workspace} homeHref="/welcome" />,
    );
    expect(screen.getByTestId("app-header-brand-link")).not.toHaveAttribute("aria-current");
  });

  it("should fall back to /welcome on the brand link when no homeHref is provided", () => {
    // Anonymous / shell-unavailable state: the server cannot resolve homeHref.
    render(<AppHeader profile={null} workspace={null} homeHref={null} />);
    expect(screen.getByTestId("app-header-brand-link")).toHaveAttribute("href", "/welcome");
  });

  it("should accept an owner without an active subscription and resolve homeHref to /welcome", () => {
    // Mirrors the entry-route policy: an OWNER with no subscription lands on
    // /welcome so the brand link reflects the only path the user can actually open.
    mocks.homeHref = "/welcome";
    mocks.pathname = "/chat";
    render(<AppHeader profile={{ username: "Ada", imageUrl: null }} workspace={workspace} homeHref="/welcome" />);
    const brandLink = screen.getByTestId("app-header-brand-link");
    expect(brandLink).toHaveAttribute("href", "/welcome");
    // Even on /chat the link is not active because the resolved home is /welcome.
    expect(brandLink).not.toHaveAttribute("aria-current");
  });
});
