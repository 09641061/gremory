/** @vitest-environment jsdom */
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { WorkspaceHeaderViewModel } from "@/contexts/business/application/model/business-workspace.view-models";
vi.mock("next/navigation", () => ({ usePathname: () => "/schedule", useSearchParams: () => new URLSearchParams() }));
vi.mock("@/contexts/assistant/interfaces/components/sidebar/assistant-chats-section", () => ({ AssistantChatsSection: () => null }));
vi.mock("@/contexts/business/interfaces/components/workspace/workspace-switcher/workspace-switcher", () => ({ WorkspaceSwitcher: () => null }));
import { AppSidebar } from "@/contexts/shared/interfaces/components/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/contexts/shared/interfaces/components/ui/sidebar";

function mountSidebar(width: number) {
  Object.defineProperty(window, "innerWidth", { configurable: true, value: width });
  window.matchMedia = vi.fn().mockReturnValue({ matches: width < 768, addEventListener: vi.fn(), removeEventListener: vi.fn() });
  return render(<SidebarProvider><SidebarTrigger /><AppSidebar
    initialAssistantConversations={[]}
    workspace={{ establishments: [], activeEstablishmentId: "branch", accessPolicy: { canManageBilling: false } } as unknown as WorkspaceHeaderViewModel}
    visibleRoutes={["/schedule", "/crm"]}
    showAssistantSection={false}
    showAssistantNavigation={false}
    showWorkspaceSwitcher={false}
  /></SidebarProvider>);
}

it("should retain desktop navigation below Header without mounting account controls", async () => {
  const { container } = mountSidebar(1280);
  expect(screen.getByRole("link", { name: "Schedule" })).toHaveAttribute("href", "/schedule?establishmentId=branch");
  expect(screen.getByRole("link", { name: "Schedule" })).toHaveAttribute("aria-current", "page");
  expect(container.querySelector('[data-slot="sidebar-container"]')).toHaveClass("top-16", "h-[calc(100svh-4rem)]");
  expect(container.querySelector('[data-slot="profile-menu-card"]')).toBeNull();
  expect(container.querySelector('[data-slot="dropdown-menu-trigger"]')).toBeNull();
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
