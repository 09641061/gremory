/** @vitest-environment jsdom */
import { render, screen, within } from "@testing-library/react";

// Hoisted mocks must be declared before vi.mock factories run so the
// factories can close over the same mutable references used by tests.
const mocks = vi.hoisted(() => ({
  pathname: "/chat",
  sidebar: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => mocks.pathname,
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@/contexts/notifications/interfaces/components/notification-dropdown", () => ({
  NotificationDropdown: () => null,
}));

vi.mock("@/contexts/profiles/interfaces/components/profile/sidebar-profile", () => ({
  SidebarProfile: () => <button>Profile</button>,
}));

vi.mock("@/contexts/shared/interfaces/i18n", () => ({
  LocaleSync: () => null,
  useI18n: () => ({ t: new Proxy({}, { get: () => (k: string) => k }) }),
}));

vi.mock("@/contexts/notifications/interfaces/components/push-notification-register-server", () => ({
  PushNotificationRegisterServer: () => null,
}));

vi.mock("@/contexts/shared/interfaces/components/header/app-header", () => ({
  AppHeader: () => <header role="banner" data-testid="app-header-stub">Header</header>,
}));

vi.mock("@/contexts/shared/interfaces/components/header/app-header-server", () => ({
  AppHeaderServer: () => <header role="banner" data-testid="app-header-stub">Header</header>,
}));

vi.mock("@/contexts/shared/interfaces/components/header/app-header-fallback", () => ({
  AppHeaderFallback: () => <div data-testid="app-header-fallback-stub" className="h-16" />,
}));

vi.mock("@/contexts/shared/interfaces/components/sidebar/app-sidebar-shell-server", () => ({
  AppShellSidebarServer: () => {
    mocks.sidebar();
    return <aside role="complementary">Sidebar</aside>;
  },
}));

vi.mock("@/contexts/shared/interfaces/components/sidebar/app-sidebar-fallback", () => ({
  AppSidebarFallback: () => null,
}));

// Use the REAL SidebarProvider / SidebarInset so the assertions prove the
// production layout actually contains them (rather than a test-only stub).
// The mobile hook inside SidebarProvider calls window.matchMedia, so jsdom
// needs a polyfill before render().
import ProtectedAppShell from "@/contexts/shared/interfaces/components/protected-app-shell";
import WelcomeLayout from "@/app/(protected)/(welcome)/layout";

beforeEach(() => {
  mocks.pathname = "/chat";
  mocks.sidebar.mockClear();
  window.matchMedia = vi.fn().mockReturnValue({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  });
});

describe("ProtectedAppShell layout invariant", () => {
  it("should keep the header as a sibling above SidebarProvider, never a descendant", () => {
    // Given ProtectedAppShell is rendered with arbitrary page content.
    const { container } = render(
      <ProtectedAppShell>
        <h1>Chat</h1>
      </ProtectedAppShell>,
    );

    // Then a single banner (the <header>) is rendered.
    const banner = screen.getByRole("banner");
    expect(banner).toBeInTheDocument();

    // And the real SidebarProvider wrapper is present.
    const sidebarWrapper = container.querySelector('[data-slot="sidebar-wrapper"]');
    expect(sidebarWrapper).not.toBeNull();

    // And the banner is NOT contained by the sidebar wrapper …
    expect(sidebarWrapper!.contains(banner)).toBe(false);
    // … nor is the sidebar wrapper contained by the banner.
    expect(banner.contains(sidebarWrapper!)).toBe(false);

    // And the banner comes BEFORE the sidebar wrapper in document order.
    expect(
      banner.compareDocumentPosition(sidebarWrapper!) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it("should wrap the page content in SidebarInset with a mobile-only trigger", () => {
    // Given ProtectedAppShell with arbitrary page content.
    const { container } = render(
      <ProtectedAppShell>
        <h1>Chat</h1>
      </ProtectedAppShell>,
    );

    // Then the real SidebarInset is present and rendered as <main>.
    const inset = container.querySelector('[data-slot="sidebar-inset"]');
    expect(inset).not.toBeNull();
    expect(inset!.tagName.toLowerCase()).toBe("main");

    // And it lives INSIDE the sidebar-wrapper (its parent in the DOM).
    const sidebarWrapper = container.querySelector('[data-slot="sidebar-wrapper"]');
    expect(sidebarWrapper!.contains(inset!)).toBe(true);

    // And it contains the SidebarTrigger and the page content.
    const trigger = within(inset as HTMLElement).getByRole("button", { name: "Toggle Sidebar" });
    expect(trigger).toHaveAttribute("data-sidebar", "trigger");
    expect(within(inset as HTMLElement).getByRole("heading", { name: "Chat" })).toBeInTheDocument();

    // And the trigger is hidden on md+ viewports (the regression that motivated
    // the SidebarInset adoption: the trigger must NOT block the desktop layout).
    expect(trigger).toHaveClass("md:hidden");
  });

  it("should render only the header and main on the Welcome route, with no sidebar", () => {
    // Given the Welcome layout.
    const { container } = render(
      <WelcomeLayout>
        <h1>Welcome</h1>
      </WelcomeLayout>,
    );

    // Then exactly one banner is mounted.
    expect(screen.getAllByRole("banner")).toHaveLength(1);

    // And the page content sits inside <main>.
    expect(
      within(screen.getByRole("main")).getByRole("heading", { name: "Welcome" }),
    ).toBeVisible();

    // And NO SidebarProvider, NO SidebarInset, NO sidebar wrapper was rendered.
    expect(container.querySelector('[data-slot="sidebar-wrapper"]')).toBeNull();
    expect(container.querySelector('[data-slot="sidebar-inset"]')).toBeNull();

    // And the real AppShellSidebarServer was never invoked.
    expect(mocks.sidebar).not.toHaveBeenCalled();

    // And no mobile trigger leaked into the welcome tree.
    expect(screen.queryByRole("button", { name: "Toggle Sidebar" })).toBeNull();

    // And the banner is NOT inside the (absent) main element — they are
    // siblings inside the layout fragment, exactly as authored.
    const banner = screen.getByRole("banner");
    const main = screen.getByRole("main");
    expect(main.contains(banner)).toBe(false);
    expect(banner.contains(main)).toBe(false);
  });

  it("should order the app route DOM as banner → aside (sidebar) → main (sidebar-inset)", () => {
    // Given ProtectedAppShell with arbitrary page content.
    const { container } = render(
      <ProtectedAppShell>
        <h1>Chat</h1>
      </ProtectedAppShell>,
    );

    const banner = screen.getByRole("banner");
    const aside = screen.getByRole("complementary");
    const sidebarWrapper = container.querySelector('[data-slot="sidebar-wrapper"]');
    const inset = container.querySelector('[data-slot="sidebar-inset"]');

    expect(sidebarWrapper).not.toBeNull();
    expect(inset).not.toBeNull();

    // The sidebar wrapper must contain the rendered <aside> and the inset.
    expect(sidebarWrapper!.contains(aside)).toBe(true);
    expect(sidebarWrapper!.contains(inset!)).toBe(true);

    // The banner precedes the sidebar wrapper (re-stated here so this it()
    // stands on its own as a structural snapshot of the route).
    expect(
      banner.compareDocumentPosition(sidebarWrapper!) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();

    // Inside the provider, <aside> and SidebarInset are siblings, with the
    // aside painted first on the page.
    expect(aside.compareDocumentPosition(inset!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();

    // Top-to-bottom DOM order: banner → aside → main.
    expect(banner.compareDocumentPosition(aside) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(banner.compareDocumentPosition(inset!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("should wrap the header and SidebarProvider in a flex column that owns the viewport", () => {
    // Regression for the redundant vertical scroll on app routes. The fix
    // moved the viewport-fill responsibility up: a `flex h-svh overflow-hidden
    // flex-col` wrapper now encloses both the sticky header AND the sidebar
    // provider, and the provider itself grows with `flex-1` instead of
    // claiming 100svh on its own. The page total must therefore stay at 100svh.
    const { container } = render(
      <ProtectedAppShell>
        <h1>Chat</h1>
      </ProtectedAppShell>,
    );

    const banner = screen.getByRole("banner");
    const sidebarWrapper = container.querySelector('[data-slot="sidebar-wrapper"]');
    expect(sidebarWrapper).not.toBeNull();

    // The banner and the sidebar wrapper share a single flex-column parent.
    const wrapper = banner.parentElement;
    expect(wrapper).not.toBeNull();
    expect(wrapper).toBe(sidebarWrapper!.parentElement);

    // The shared wrapper is a fixed `flex h-svh overflow-hidden flex-col`
    // viewport-owning column. The exact token list may grow over time, but
    // these classes prevent the document from becoming the scroll owner.
    expect(wrapper).toHaveClass("flex");
    expect(wrapper).toHaveClass("flex-col");
    expect(wrapper).toHaveClass("h-svh");
    expect(wrapper).toHaveClass("overflow-hidden");

    // The wrapper is the viewport-owner, NOT the sidebar provider: the
    // provider no longer carries `min-h-svh` (otherwise the column would
    // resolve to 100svh + 64px header = scrollbar). The provider must carry
    // `flex-1` so it grows to fill the remaining column space instead.
    expect(sidebarWrapper).not.toHaveClass("min-h-svh");
    expect(sidebarWrapper).toHaveClass("flex-1");

    // Banner precedes sidebar wrapper in document order (carried forward from
    // the original invariant — the header is the first column child).
    expect(
      banner.compareDocumentPosition(sidebarWrapper!) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it("renders the push-notification register as a non-visual last child of the viewport-owning wrapper", () => {
    const { container } = render(
      <ProtectedAppShell>
        <h1>Chat</h1>
      </ProtectedAppShell>,
    );
    const sidebarWrapper = container.querySelector('[data-slot="sidebar-wrapper"]');
    const wrapper = sidebarWrapper!.parentElement;
    const lastChild = wrapper!.lastElementChild;
    expect(lastChild).not.toBeNull();
    // It must NOT be inside SidebarInset (otherwise it would participate in the main content flex column).
    const inset = container.querySelector('[data-slot="sidebar-inset"]');
    expect(inset!.contains(lastChild!)).toBe(false);
  });
});
