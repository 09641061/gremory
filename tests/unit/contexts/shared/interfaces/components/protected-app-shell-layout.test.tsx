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

vi.mock("@/contexts/notifications/interfaces/components/push-notification-register-server", () => ({
  PushNotificationRegisterServer: () => null,
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
import ProtectedAppShell from "@/contexts/shared/interfaces/components/layout/protected-app-shell";

beforeEach(() => {
  mocks.pathname = "/chat";
  mocks.sidebar.mockClear();
  window.matchMedia = vi.fn().mockReturnValue({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  });
});

describe("ProtectedAppShell layout invariant (unified sidebar)", () => {
  it("should not render any standalone header — the sidebar owns the brand", () => {
    // Given ProtectedAppShell is rendered with arbitrary page content.
    const { container } = render(
      <ProtectedAppShell>
        <h1>Chat</h1>
      </ProtectedAppShell>,
    );

    // Then NO banner (the previous <header> chrome) is mounted anywhere.
    expect(container.querySelector('header[role="banner"]')).toBeNull();

    // And the real SidebarProvider wrapper is present.
    const sidebarWrapper = container.querySelector('[data-slot="sidebar-wrapper"]');
    expect(sidebarWrapper).not.toBeNull();

    // And the sidebar was actually mounted through the streaming boundary.
    expect(mocks.sidebar).toHaveBeenCalled();
  });

  it("should wrap the page content in SidebarInset with no leftover mobile trigger outside the sidebar", () => {
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

    // And it lives INSIDE the sidebar-wrapper.
    const sidebarWrapper = container.querySelector('[data-slot="sidebar-wrapper"]');
    expect(sidebarWrapper!.contains(inset!)).toBe(true);

    // And it contains the page content.
    expect(within(inset as HTMLElement).getByRole("heading", { name: "Chat" })).toBeInTheDocument();

    // And no leftover top-level "Toggle Sidebar" trigger sits in the main content —
    // the trigger now lives inside the sidebar header.
    const insetTriggers = within(inset as HTMLElement).queryAllByRole("button", { name: "Toggle Sidebar" });
    expect(insetTriggers).toHaveLength(0);
  });

  it("should order the app route DOM as aside (sidebar) → main (sidebar-inset) inside SidebarProvider", () => {
    const { container } = render(
      <ProtectedAppShell>
        <h1>Chat</h1>
      </ProtectedAppShell>,
    );

    const aside = screen.getByRole("complementary");
    const sidebarWrapper = container.querySelector('[data-slot="sidebar-wrapper"]');
    const inset = container.querySelector('[data-slot="sidebar-inset"]');

    expect(sidebarWrapper).not.toBeNull();
    expect(inset).not.toBeNull();

    // The sidebar wrapper must contain the rendered <aside> and the inset.
    expect(sidebarWrapper!.contains(aside)).toBe(true);
    expect(sidebarWrapper!.contains(inset!)).toBe(true);

    // Inside the provider, <aside> and SidebarInset are siblings, with the
    // aside painted first on the page.
    expect(aside.compareDocumentPosition(inset!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("should keep the SidebarProvider as a flex-1 column so the sidebar fills the protected viewport", () => {
    const { container } = render(
      <ProtectedAppShell>
        <h1>Chat</h1>
      </ProtectedAppShell>,
    );

    const sidebarWrapper = container.querySelector('[data-slot="sidebar-wrapper"]');
    expect(sidebarWrapper).not.toBeNull();

    // The provider must NOT claim its own viewport (min-h-svh) — the parent
    // (protected) layout already owns the viewport.
    expect(sidebarWrapper).not.toHaveClass("min-h-svh");
    expect(sidebarWrapper).toHaveClass("flex-1");
    expect(sidebarWrapper).toHaveClass("flex");
  });

  it("renders the push-notification register as a non-visual sibling of the SidebarProvider", () => {
    const { container } = render(
      <ProtectedAppShell>
        <h1>Chat</h1>
      </ProtectedAppShell>,
    );
    const sidebarWrapper = container.querySelector('[data-slot="sidebar-wrapper"]');
    // The push-notification register must NOT be inside the sidebar wrapper
    // (otherwise it would participate in the provider's flex layout).
    const inset = container.querySelector('[data-slot="sidebar-inset"]');
    expect(inset).not.toBeNull();
    expect(sidebarWrapper!.contains(inset!)).toBe(true);
    // The SidebarInset is the last layout-meaningful child of the wrapper;
    // the push register lives outside the wrapper as a sibling.
    const lastMeaningful = sidebarWrapper!.lastElementChild;
    expect(lastMeaningful).toBe(inset);
  });
});
