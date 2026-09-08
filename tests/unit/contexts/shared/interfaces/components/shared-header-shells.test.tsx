/** @vitest-environment jsdom */
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { WorkspaceHeaderViewModel } from "@/contexts/business/application/model/business-workspace.view-models";

const mocks = vi.hoisted(() => ({ pathname: "/welcome", replace: vi.fn(), signOut: vi.fn(), sidebar: vi.fn() }));
vi.mock("next/navigation", () => ({ usePathname: () => mocks.pathname, useSearchParams: () => new URLSearchParams("establishmentId=branch"), useRouter: () => ({ replace: mocks.replace }) }));
vi.mock("@/contexts/iam/interfaces/actions/sign-out.action", () => ({ signOutAction: mocks.signOut }));
vi.mock("@/contexts/notifications/interfaces/components/notification-dropdown", () => ({ NotificationDropdown: () => <button>Notifications</button> }));
vi.mock("@/contexts/shared/interfaces/components/app-header-server", () => ({ AppHeaderServer: () => <AppHeader profile={{ username: "Ada", imageUrl: null }} workspace={workspace} /> }));
vi.mock("@/contexts/shared/interfaces/components/app-shell-sidebar-server", () => ({ AppShellSidebarServer: () => { mocks.sidebar(); return <aside>Navigation</aside>; } }));
import { AppHeader } from "@/contexts/shared/interfaces/components/app-header";
import WelcomeLayout from "@/app/(protected)/(welcome)/layout";
import ProtectedAppShell from "@/contexts/shared/interfaces/components/protected-app-shell";
const workspace = { establishments: [{ id: "branch" }], accessPolicy: { canManageBilling: false } } as WorkspaceHeaderViewModel;

beforeEach(() => {
  mocks.pathname = "/welcome";
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
    render(<ProtectedAppShell><h1>Chat</h1></ProtectedAppShell>);
    expect(screen.getAllByRole("banner")).toHaveLength(1);
    expect(screen.getByRole("banner").compareDocumentPosition(screen.getByRole("complementary")) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(screen.getByRole("button", { name: "Toggle Sidebar" })).toHaveClass("md:hidden");
    expect(mocks.sidebar).toHaveBeenCalled();
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
    render(<AppHeader profile={{ username: "Ada", imageUrl: null }} workspace={{ ...workspace, accessPolicy: { ...workspace.accessPolicy!, canManageBilling: true } }} />);
    await user.click(screen.getByRole("button", { name: "Ada" }));
    expect(await screen.findByRole("menuitem", { name: "Upgrade plan" })).toHaveAttribute("href", "/upgrade");
    expect(screen.getByRole("menuitem", { name: "Invoices" })).toHaveAttribute("href", "/invoice?establishmentId=branch");
  });

  it("should keep member billing restrictions and keyboard menu operation", async () => {
    mocks.pathname = "/schedule";
    const user = userEvent.setup();
    render(<AppHeader profile={{ username: "Ada", imageUrl: null }} workspace={workspace} />);
    screen.getByRole("button", { name: "Ada" }).focus();
    await user.keyboard("{Enter}");
    expect(await screen.findByRole("menuitem", { name: "Profile" })).toBeVisible();
    expect(screen.queryByRole("menuitem", { name: "Invoices" })).toBeNull();
    await user.keyboard("{Escape}");
    expect(screen.getByRole("button", { name: "Ada" })).toHaveFocus();
  });
});
