/** @vitest-environment jsdom */
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Sidebar } from "@/contexts/shared/interfaces/components/navigation/sidebar";

vi.mock("next/navigation", () => ({
  usePathname: () => "/billing",
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

vi.mock("@/contexts/iam/interfaces/actions/sign-out.action", () => ({
  signOutAction: vi.fn().mockResolvedValue({ status: "success", error: null }),
}));

describe("Sidebar Component", () => {
  it("renders brand name 'Takodu'", () => {
    render(<Sidebar />);
    expect(screen.getByText("Takodu")).toBeDefined();
  });

  it("renders all main navigation items", () => {
    render(<Sidebar />);
    expect(screen.getByText("Dashboard")).toBeDefined();
    expect(screen.getByText("Billing")).toBeDefined();
    expect(screen.getByText("Establishments")).toBeDefined();
    expect(screen.getByText("Settings")).toBeDefined();
  });

  it("renders footer items Help Center and Sign Out", () => {
    render(<Sidebar />);
    expect(screen.getByText("Help Center")).toBeDefined();
    expect(screen.getByText("Sign Out")).toBeDefined();
  });
});
