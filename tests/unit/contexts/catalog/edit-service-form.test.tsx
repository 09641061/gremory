/** @vitest-environment jsdom */
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { EditServiceForm } from "@/contexts/catalog/interfaces/components/catalog/edit-service-form";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: vi.fn(),
    push: vi.fn(),
  }),
}));

vi.mock("../../hooks/use-update-catalog-service", () => ({
  useUpdateCatalogService: () => ({
    state: { status: "idle", error: null },
    formAction: vi.fn(),
    pending: false,
  }),
}));

vi.mock("../../hooks/use-change-catalog-service-status", () => ({
  useChangeCatalogServiceStatus: () => ({
    changeStatus: vi.fn(),
    pending: false,
    state: { status: "idle", error: null },
  }),
}));

describe("EditServiceForm Component Permissions", () => {
  const mockService = {
    id: "svc-123",
    name: "Haircut",
    description: "Standard haircut",
    price: 30.00,
    durationMinutes: 30,
    preparationMinutes: 5,
    cleanupMinutes: 5,
    status: "ACTIVE" as const,
  };

  it("renders form fields as editable when canUpdateService is true", () => {
    render(
      <EditServiceForm
        service={mockService}
        canUpdateService={true}
        canDeleteService={true}
        onCancel={vi.fn()}
      />
    );

    // Inputs should not be disabled
    const nameInput = screen.getByLabelText(/Name/i) as HTMLInputElement;
    expect(nameInput.disabled).toBe(false);
    expect(nameInput.value).toBe("Haircut");

    // Save button should be rendered
    expect(screen.getByRole("button", { name: "Save" })).toBeDefined();
  });

  it("renders form fields as read-only (disabled) when canUpdateService is false", () => {
    render(
      <EditServiceForm
        service={mockService}
        canUpdateService={false}
        canDeleteService={true}
        onCancel={vi.fn()}
      />
    );

    // Inputs should be disabled (via fieldset)
    const nameInput = screen.getByLabelText(/Name/i) as HTMLInputElement;
    expect(nameInput.disabled).toBe(true);

    // Save button should not be rendered
    expect(screen.queryByRole("button", { name: "Save" })).toBeNull();
  });
});
