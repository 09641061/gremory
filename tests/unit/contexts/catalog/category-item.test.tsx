/** @vitest-environment jsdom */
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { CategoryItem } from "@/contexts/catalog/interfaces/components/catalog/category-item";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: vi.fn(),
    push: vi.fn(),
  }),
}));

describe("CategoryItem Component Permissions", () => {
  const mockCategory = {
    id: "cat-123",
    name: "Hair Services",
  };

  it("does not render dropdown options if user has no edit/delete/create permissions", () => {
    render(
      <CategoryItem
        cat={mockCategory}
        services={[]}
        selectedCategoryId="cat-123"
        isExpanded={false}
        isDragTarget={false}
        onToggleExpand={vi.fn()}
        onSelectService={vi.fn()}
        onOpenEditCategoryModal={vi.fn()}
        onDragStart={vi.fn()}
        onDragEnd={vi.fn()}
        onDragOver={vi.fn()}
        onDragLeave={vi.fn()}
        onDrop={vi.fn()}
        setIsMobileOpen={vi.fn()}
        onDeleteCategory={vi.fn()}
        setAlertMessage={vi.fn()}
        canUpdateCategory={false}
        canDeleteCategory={false}
        canCreateService={false}
      />
    );

    // Dropdown options button (with title "Category Options") should NOT be rendered
    const dropdownButton = screen.queryByTitle("Category Options");
    expect(dropdownButton).toBeNull();
  });

  it("renders dropdown button if user has at least one catalog modify permission", () => {
    render(
      <CategoryItem
        cat={mockCategory}
        services={[]}
        selectedCategoryId="cat-123"
        isExpanded={false}
        isDragTarget={false}
        onToggleExpand={vi.fn()}
        onSelectService={vi.fn()}
        onOpenEditCategoryModal={vi.fn()}
        onDragStart={vi.fn()}
        onDragEnd={vi.fn()}
        onDragOver={vi.fn()}
        onDragLeave={vi.fn()}
        onDrop={vi.fn()}
        setIsMobileOpen={vi.fn()}
        onDeleteCategory={vi.fn()}
        setAlertMessage={vi.fn()}
        canUpdateCategory={true}
        canDeleteCategory={false}
        canCreateService={false}
      />
    );

    // Dropdown options button (with title "Category Options") should be rendered
    const dropdownButton = screen.getByTitle("Category Options");
    expect(dropdownButton).toBeDefined();
  });
});
