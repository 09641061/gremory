/** @vitest-environment jsdom */
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { WorkspaceHeaderViewModel } from "@/contexts/business/application/model/business-workspace.view-models";
vi.mock("next/navigation", () => ({ usePathname: () => "/schedule", useSearchParams: () => new URLSearchParams(), useRouter: () => ({ replace: vi.fn(), push: vi.fn(), back: vi.fn(), refresh: vi.fn() }) }));
vi.mock("@/contexts/assistant/interfaces/components/sidebar/assistant-chats-section", () => ({ AssistantChatsSection: () => null }));
vi.mock("@/contexts/business/interfaces/components/workspace/workspace-switcher/workspace-switcher", () => ({ WorkspaceSwitcher: () => null }));
import { AppSidebar } from "@/contexts/shared/interfaces/components/sidebar/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/contexts/shared/interfaces/components/ui/sidebar";

function mountSidebar(width: number) {
  Object.defineProperty(window, "innerWidth", { configurable: true, value: width });
  window.matchMedia = vi.fn().mockReturnValue({ matches: width < 768, addEventListener: vi.fn(), removeEventListener: vi.fn() });
  return render(<SidebarProvider><SidebarTrigger /><AppSidebar
    initialAssistantConversations={[]}
    profile={null}
    workspace={{ establishments: [], activeEstablishmentId: "branch", accessPolicy: { canManageBilling: false } } as unknown as WorkspaceHeaderViewModel}
    homeHref="/chat"
    visibleRoutes={["/schedule", "/crm"]}
    showAssistantSection={false}
    showAssistantNavigation={false}
    showWorkspaceSwitcher={false}
  /></SidebarProvider>);
}

it("should retain desktop navigation and account controls inside the unified sidebar", async () => {
  const { container } = mountSidebar(1280);
  expect(screen.getByRole("link", { name: "Schedule" })).toHaveAttribute("href", "/schedule?establishmentId=branch");
  expect(screen.getByRole("link", { name: "Schedule" })).toHaveAttribute("aria-current", "page");
  // The sidebar now owns the full viewport — no top offset for a header.
  expect(container.querySelector('[data-slot="sidebar-container"]')).toHaveClass("inset-y-0", "h-svh");
  expect(container.querySelector('[data-slot="sidebar-container"]')).not.toHaveClass("top-16");
  fireEvent.keyDown(window, { key: "b", ctrlKey: true });
  await waitFor(() => expect(container.querySelector('[data-slot="sidebar"]')).toHaveAttribute("data-state", "collapsed"));
});

it("should open and close the existing mobile sheet using trigger and navigation shortcut", async () => {
  const user = userEvent.setup();
  mountSidebar(375);
  expect(screen.queryByRole("dialog")).toBeNull();
  await user.click(screen.getByRole("button", { name: "Toggle Sidebar" }));
  expect(await screen.findByRole("dialog", { name: "Sidebar" })).toBeVisible();
  expect(screen.getByRole("link", { name: "Schedule" })).toBeVisible();
  fireEvent.keyDown(window, { key: "b", ctrlKey: true });
  await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
});
