/** @vitest-environment jsdom */
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { EstablishmentDetailCard } from "@/contexts/business/interfaces/components/establishment/establishments-page/establishment-detail-card";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: vi.fn(),
  }),
}));

vi.mock("@/contexts/business/interfaces/actions/establishment.actions", () => ({
  updateEstablishmentAction: vi.fn().mockResolvedValue({
    status: "success",
    error: null,
  }),
}));

describe("EstablishmentDetailCard Component", () => {
  const mockEstablishment = {
    id: "est-123",
    name: "Test Establishment",
    photoUrl: "http://example.com/photo.jpg",
    timeZone: "America/Lima",
  };

  it("renders detail card when establishment is selected (Happy Case - Edit allowed)", () => {
    render(
      <EstablishmentDetailCard
        establishment={mockEstablishment}
        canUpdate={true}
        onCancel={vi.fn()}
      />
    );

    // Verify header and fields are shown
    expect(screen.getByText("Establishment Name")).toBeDefined();
    // Verify inputs are enabled
    const input = screen.getByPlaceholderText("Establishment name") as HTMLInputElement;
    expect(input.disabled).toBe(false);
    expect(input.value).toBe("Test Establishment");

    // Verify action buttons are visible
    expect(screen.getByRole("button", { name: "Save" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeDefined();
  });

  it("renders detail card as read-only when user lacks update permission (Unhappy Case - Read only)", () => {
    render(
      <EstablishmentDetailCard
        establishment={mockEstablishment}
        canUpdate={false}
        onCancel={vi.fn()}
      />
    );

    // Verify fields are shown
    expect(screen.getByText("Establishment Name")).toBeDefined();
    // Verify inputs are disabled
    const input = screen.getByPlaceholderText("Establishment name") as HTMLInputElement;
    expect(input.disabled).toBe(true);

    // Verify action buttons are not rendered
    expect(screen.queryByRole("button", { name: "Save" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Cancel" })).toBeNull();
  });
});
