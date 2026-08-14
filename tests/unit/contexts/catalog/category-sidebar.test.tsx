/** @vitest-environment jsdom */
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { CategorySidebar } from "@/contexts/catalog/interfaces/components/catalog/category-sidebar";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: vi.fn(),
    push: vi.fn(),
  }),
}));

const baseProps = {
  selectedServiceId: undefined,
  selectedCategoryId: undefined,
  onSelectService: vi.fn(),
  onSelectCategory: vi.fn(),
  onOpenCreateCategoryModal: vi.fn(),
  onOpenEditCategoryModal: vi.fn(),
  canCreateCategory: true,
  canUpdateCategory: true,
  canDeleteCategory: true,
  canCreateService: true,
};

describe("CategorySidebar uncategorized services", () => {
  it("renders services without a category even when there are no categories", () => {
    render(
      <CategorySidebar
        {...baseProps}
        categories={[]}
        services={[{ id: "svc-1", name: "Solo Haircut", categoryId: null }]}
      />
    );

    // Rendered twice: mobile drawer content is not mounted, desktop sidebar is
    expect(screen.getAllByText("Solo Haircut").length).toBeGreaterThan(0);
    expect(screen.queryByText("No categories available")).toBeNull();
  });

  it("lists services without a category above the categories", () => {
    const { container } = render(
      <CategorySidebar
        {...baseProps}
        categories={[{ id: "cat-1", name: "Hair Services" }]}
        services={[
          { id: "svc-1", name: "Solo Haircut", categoryId: null },
          { id: "svc-2", name: "Coloring", categoryId: "cat-1" },
        ]}
      />
    );

    const loose = screen.getAllByText("Solo Haircut")[0];
    const category = screen.getAllByText("Hair Services")[0];
    expect(loose.compareDocumentPosition(category) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(container.textContent).not.toContain("Uncategorized");
  });

  it("shows the empty state only when there are neither categories nor services", () => {
    render(<CategorySidebar {...baseProps} categories={[]} services={[]} />);

    expect(screen.getAllByText("No categories available").length).toBeGreaterThan(0);
  });

  it("offers a category-less create service action", () => {
    const onCreateService = vi.fn();
    render(
      <CategorySidebar
        {...baseProps}
        categories={[]}
        services={[]}
        onCreateService={onCreateService}
      />
    );

    screen.getAllByText("Create Service")[0].click();
    expect(onCreateService).toHaveBeenCalledWith(undefined);
  });
});
