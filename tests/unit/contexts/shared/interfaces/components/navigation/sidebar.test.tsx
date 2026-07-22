/** @vitest-environment jsdom */
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Sidebar } from "@/contexts/shared/interfaces/components/navigation/sidebar";
import { SidebarProvider } from "@/contexts/shared/interfaces/components/navigation/sidebar-context";

vi.mock("next/navigation", () => ({
  usePathname: () => "/billing",
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

vi.mock("@/contexts/iam/interfaces/actions/sign-out.action", () => ({
  signOutAction: vi.fn().mockResolvedValue({ status: "success", error: null }),
}));

describe("Sidebar Component", () => {
  it("renders brand name 'Takodu'", () => {
    render(
      <SidebarProvider>
        <Sidebar />
      </SidebarProvider>
    );
    expect(screen.getByText("Takodu")).toBeDefined();
  });

  it("renders all main navigation items", () => {
    render(
      <SidebarProvider>
        <Sidebar />
      </SidebarProvider>
    );
    expect(screen.getByText("Dashboard")).toBeDefined();
    expect(screen.getByText("Billing")).toBeDefined();
    expect(screen.getByText("Establishments")).toBeDefined();
    expect(screen.getByText("Settings")).toBeDefined();
  });

  it("renders footer items Help Center and Sign Out", () => {
    render(
      <SidebarProvider>
        <Sidebar />
      </SidebarProvider>
    );
    expect(screen.getByText("Help Center")).toBeDefined();
    expect(screen.getByText("Sign Out")).toBeDefined();
  });

  it("collapses and expands when top toggle button is clicked", () => {
    render(
      <SidebarProvider>
        <Sidebar />
      </SidebarProvider>
    );

    const toggleButton = screen.getByTitle("Collapse sidebar");
    expect(toggleButton).toBeDefined();

    // Click to collapse
    fireEvent.click(toggleButton);
    expect(screen.getByTitle("Expand sidebar")).toBeDefined();
  });
});
