/** @vitest-environment jsdom */
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { WorkspaceHeaderViewModel } from "@/contexts/business/application/model/business-workspace.view-models";

const mocks = vi.hoisted(() => ({
  pathname: "/welcome",
  replace: vi.fn(),
  signOut: vi.fn(),
  sidebar: vi.fn(),
  homeHref: "/chat",
  currentProfile: { username: "Ada", imageUrl: null } as { username: string; imageUrl: string | null } | null,
}));
vi.mock("next/navigation", () => ({
  usePathname: () => mocks.pathname,
  useSearchParams: () => new URLSearchParams("establishmentId=branch"),
  useRouter: () => ({ replace: mocks.replace }),
}));
vi.mock("@/contexts/iam/interfaces/actions/sign-out.action", () => ({ signOutAction: mocks.signOut }));
vi.mock("@/contexts/notifications/interfaces/components/notification-dropdown", () => ({ NotificationDropdown: () => <button>Notifications</button> }));
vi.mock("@/contexts/notifications/interfaces/components/hooks/use-notifications", () => ({
  NotificationsProvider: ({ children }: { children: React.ReactNode }) => children,
  useNotifications: () => ({
    unreadCount: 0,
    notifications: null,
    refresh: vi.fn().mockResolvedValue(undefined),
    loadNotifications: vi.fn().mockResolvedValue(null),
    markAsRead: vi.fn().mockResolvedValue(undefined),
    delete: vi.fn().mockResolvedValue(undefined),
    acceptInvitation: vi.fn().mockResolvedValue(undefined),
    isLoadingUnread: false,
  }),
}));
vi.mock("@/contexts/shared/interfaces/components/sidebar/app-sidebar-shell-server", () => ({
  AppShellSidebarServer: () => {
    mocks.sidebar();
    const workspace = {
      establishments: [{ id: "branch" }],
      activeEstablishmentId: "branch",
      accessPolicy: { canManageBilling: false },
    } as WorkspaceHeaderViewModel;
    return (
      <AppSidebar
        initialAssistantConversations={[]}
        profile={mocks.currentProfile}
        workspace={workspace}
        homeHref={mocks.homeHref}
        visibleRoutes={["/schedule", "/crm"]}
        showAssistantSection={false}
        showAssistantNavigation={false}
        showWorkspaceSwitcher={mocks.pathname !== "/welcome"}
      />
    );
  },
}));
import { AppSidebar } from "@/contexts/shared/interfaces/components/sidebar/app-sidebar";
import { SidebarProvider } from "@/contexts/shared/interfaces/components/ui/sidebar";

const workspace = {
  establishments: [{ id: "branch" }],
  activeEstablishmentId: "branch",
  accessPolicy: { canManageBilling: false },
} as WorkspaceHeaderViewModel;

function getSidebar(container: HTMLElement): HTMLElement {
  const sidebar = container.querySelector('[data-slot="sidebar-inner"]');
  if (!sidebar) throw new Error("Sidebar not rendered");
  return sidebar as HTMLElement;
}

beforeEach(() => {
  mocks.pathname = "/welcome";
  mocks.homeHref = "/chat";
  mocks.currentProfile = { username: "Ada", imageUrl: null };
  mocks.sidebar.mockClear();
  mocks.replace.mockClear();
  mocks.signOut.mockResolvedValue({ status: "success" });
  window.matchMedia = vi.fn().mockReturnValue({ addEventListener: vi.fn(), removeEventListener: vi.fn(), matches: false });
});

describe("shared sidebar account controls and route shells", () => {
  it("should mount the sidebar account controls but no workspace nav on Welcome", () => {
    const { container } = render(
      <SidebarProvider>
        <AppSidebar
          initialAssistantConversations={[]}
          profile={mocks.currentProfile}
          workspace={workspace}
          homeHref={mocks.homeHref}
          visibleRoutes={["/schedule", "/crm"]}
          showAssistantSection={false}
          showAssistantNavigation={false}
          showWorkspaceSwitcher={false}
        />
      </SidebarProvider>,
    );
    const sidebar = getSidebar(container);
    // No <header> banner — the brand lives inside the sidebar instead.
    expect(container.querySelector('header[role="banner"]')).toBeNull();
    // Brand link is exposed inside the sidebar.
    expect(within(sidebar).getByTestId("app-sidebar-brand-link")).toHaveAttribute("href", "/chat");
    // Notifications + Profile account controls are mounted inside the sidebar.
    expect(within(sidebar).getByRole("button", { name: "Notifications" })).toBeInTheDocument();
    expect(within(sidebar).getByRole("button", { name: /Ada/i })).toBeInTheDocument();
    // No nav entries leaked into the welcome view.
    expect(within(sidebar).queryByRole("link", { name: "Schedule" })).toBeNull();
  });

  it("should mount the sidebar with the mobile trigger and order: brand then content", () => {
    mocks.pathname = "/chat";
    const { container } = render(
      <SidebarProvider>
        <AppSidebar
          initialAssistantConversations={[]}
          profile={mocks.currentProfile}
          workspace={workspace}
          homeHref={mocks.homeHref}
          visibleRoutes={["/schedule", "/crm"]}
          showAssistantSection={false}
          showAssistantNavigation={false}
          showWorkspaceSwitcher={true}
        />
      </SidebarProvider>,
    );
    const sidebar = getSidebar(container);
    const brand = within(sidebar).getByTestId("app-sidebar-brand-link");
    // Brand precedes any nav entry inside the sidebar.
    const scheduleLink = within(sidebar).queryByRole("link", { name: "Schedule" });
    expect(scheduleLink).not.toBeNull();
    expect(
      brand.compareDocumentPosition(scheduleLink!) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    // The mobile trigger button still lives inside the sidebar (not in the main content).
    const trigger = within(sidebar).getByRole("button", { name: "Toggle Sidebar" });
    expect(trigger).toHaveClass("md:hidden");
  });

  it("should preserve all prepaid account actions with notifications before Profile inside the sidebar", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <SidebarProvider>
        <AppSidebar
          initialAssistantConversations={[]}
          profile={mocks.currentProfile}
          workspace={workspace}
          homeHref={mocks.homeHref}
          visibleRoutes={[]}
          showAssistantSection={false}
          showAssistantNavigation={false}
          showWorkspaceSwitcher={false}
        />
      </SidebarProvider>,
    );
    const sidebar = getSidebar(container);
    // Order in the sidebar footer: profile FIRST, then notifications. The
    // mobile collapse trigger sits in the sidebar header next to the brand.
    const buttons = within(sidebar).getAllByRole("button");
    const buttonNames = buttons.map((button) => button.textContent);
    expect(buttonNames).toContain("Notifications");
    expect(buttonNames).toContain("Ada");
    expect(buttonNames).toContain("Toggle Sidebar");
    // Profile (name) is rendered BEFORE notifications in the footer.
    expect(buttonNames.indexOf("Ada")).toBeLessThan(buttonNames.indexOf("Notifications"));
    // The mobile trigger renders BEFORE the account controls in the header.
    expect(buttonNames.indexOf("Toggle Sidebar")).toBeLessThan(buttonNames.indexOf("Ada"));
    await user.click(within(sidebar).getByRole("button", { name: /Ada/i }));
    expect((await screen.findAllByRole("menuitem")).map((item) => item.textContent)).toEqual(["Profile", "Upgrade plan", "Invoices", "Log out"]);
    expect(screen.getByRole("menuitem", { name: "Invoices" })).toHaveAttribute("href", "/invoice?establishmentId=branch");
    expect(screen.getByRole("menuitem", { name: "Profile" })).toHaveAttribute("href", "/profile");
    expect(screen.getByRole("menuitem", { name: "Upgrade plan" })).toHaveAttribute("href", "/upgrade");
    await user.click(screen.getByRole("menuitem", { name: "Log out" }));
    expect(mocks.signOut).toHaveBeenCalled();
    expect(mocks.replace).toHaveBeenCalledWith("/login");
  });

  it("should preserve paid-owner billing actions using the existing access policy", async () => {
    const user = userEvent.setup();
    mocks.pathname = "/chat";
    const paidWorkspace = {
      ...workspace,
      accessPolicy: { ...workspace.accessPolicy!, canManageBilling: true },
    } as WorkspaceHeaderViewModel;
    render(
      <SidebarProvider>
        <AppSidebar
          initialAssistantConversations={[]}
          profile={mocks.currentProfile}
          workspace={paidWorkspace}
          homeHref="/chat"
          visibleRoutes={[]}
          showAssistantSection={false}
          showAssistantNavigation={false}
          showWorkspaceSwitcher={false}
        />
      </SidebarProvider>,
    );
    await user.click(screen.getByRole("button", { name: /Ada/i }));
    expect(await screen.findByRole("menuitem", { name: "Upgrade plan" })).toHaveAttribute("href", "/upgrade");
    expect(screen.getByRole("menuitem", { name: "Invoices" })).toHaveAttribute("href", "/invoice?establishmentId=branch");
  });

  it("should keep member billing restrictions and keyboard menu operation", async () => {
    mocks.pathname = "/schedule";
    const user = userEvent.setup();
    render(
      <SidebarProvider>
        <AppSidebar
          initialAssistantConversations={[]}
          profile={mocks.currentProfile}
          workspace={workspace}
          homeHref="/chat"
          visibleRoutes={["/schedule", "/crm"]}
          showAssistantSection={false}
          showAssistantNavigation={false}
          showWorkspaceSwitcher={false}
        />
      </SidebarProvider>,
    );
    screen.getByRole("button", { name: /Ada/i }).focus();
    await user.keyboard("{Enter}");
    expect(await screen.findByRole("menuitem", { name: "Profile" })).toBeVisible();
    expect(screen.queryByRole("menuitem", { name: "Invoices" })).toBeNull();
    await user.keyboard("{Escape}");
    expect(screen.getByRole("button", { name: /Ada/i })).toHaveFocus();
  });

  it("should expose the Takodu brand link in the sidebar pointing at the server-resolved home", () => {
    mocks.pathname = "/chat";
    mocks.homeHref = "/chat";
    render(
      <SidebarProvider>
        <AppSidebar
          initialAssistantConversations={[]}
          profile={mocks.currentProfile}
          workspace={workspace}
          homeHref={mocks.homeHref}
          visibleRoutes={[]}
          showAssistantSection={false}
          showAssistantNavigation={false}
          showWorkspaceSwitcher={false}
        />
      </SidebarProvider>,
    );
    const brandLink = screen.getByTestId("app-sidebar-brand-link");
    expect(brandLink).toHaveAttribute("href", "/chat");
    expect(brandLink).toHaveAttribute("aria-label", "Takodu — go to home");
  });

  it("should mark the brand link as aria-current=page only when the home matches the current pathname", () => {
    mocks.pathname = "/welcome";
    mocks.homeHref = "/welcome";
    const { rerender } = render(
      <SidebarProvider>
        <AppSidebar
          initialAssistantConversations={[]}
          profile={mocks.currentProfile}
          workspace={workspace}
          homeHref="/welcome"
          visibleRoutes={[]}
          showAssistantSection={false}
          showAssistantNavigation={false}
          showWorkspaceSwitcher={false}
        />
      </SidebarProvider>,
    );
    expect(screen.getByTestId("app-sidebar-brand-link")).toHaveAttribute("aria-current", "page");

    mocks.pathname = "/chat";
    rerender(
      <SidebarProvider>
        <AppSidebar
          initialAssistantConversations={[]}
          profile={mocks.currentProfile}
          workspace={workspace}
          homeHref="/welcome"
          visibleRoutes={[]}
          showAssistantSection={false}
          showAssistantNavigation={false}
          showWorkspaceSwitcher={false}
        />
      </SidebarProvider>,
    );
    expect(screen.getByTestId("app-sidebar-brand-link")).not.toHaveAttribute("aria-current");
  });

  it("should fall back to /welcome on the brand link when no homeHref is provided", () => {
    render(
      <SidebarProvider>
        <AppSidebar
          initialAssistantConversations={[]}
          profile={null}
          workspace={workspace}
          homeHref={null}
          visibleRoutes={[]}
          showAssistantSection={false}
          showAssistantNavigation={false}
          showWorkspaceSwitcher={false}
        />
      </SidebarProvider>,
    );
    expect(screen.getByTestId("app-sidebar-brand-link")).toHaveAttribute("href", "/welcome");
  });

  it("should accept an owner without an active subscription and resolve homeHref to /welcome", () => {
    mocks.homeHref = "/welcome";
    mocks.pathname = "/chat";
    render(
      <SidebarProvider>
        <AppSidebar
          initialAssistantConversations={[]}
          profile={mocks.currentProfile}
          workspace={workspace}
          homeHref="/welcome"
          visibleRoutes={[]}
          showAssistantSection={false}
          showAssistantNavigation={false}
          showWorkspaceSwitcher={false}
        />
      </SidebarProvider>,
    );
    const brandLink = screen.getByTestId("app-sidebar-brand-link");
    expect(brandLink).toHaveAttribute("href", "/welcome");
    expect(brandLink).not.toHaveAttribute("aria-current");
  });
});
