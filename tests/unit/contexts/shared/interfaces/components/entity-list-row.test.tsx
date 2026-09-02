/** @vitest-environment jsdom */
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Store } from "lucide-react";
import { EntityListRow } from "@/contexts/shared/interfaces/components/entity-list-row";

describe("EntityListRow", () => {
  it("renders the avatar image when a src is given", () => {
    render(
      <EntityListRow
        avatarSrc="https://picsum.photos/seed/replik-test/800/600"
        avatarFallbackIcon={<Store className="size-4" />}
        name="Main Store"
      />,
    );

    const img = screen.getByAltText("Main Store") as HTMLImageElement;
    expect(img.src).toBe("https://picsum.photos/seed/replik-test/800/600");
  });

  it("renders the fallback icon when an avatar URL fails", () => {
    render(
      <EntityListRow
        avatarSrc="https://picsum.photos/seed/replik-test/800/600"
        avatarFallbackIcon={<Store data-testid="fallback-icon" className="size-4" />}
        name="Main Store"
      />,
    );

    fireEvent.error(screen.getByRole("img", { name: "Main Store" }));

    expect(screen.getByTestId("fallback-icon")).toBeVisible();
    expect(screen.queryByRole("img", { name: "Main Store" })).toBeNull();
  });

  it("renders the fallback icon when there is no avatar src", () => {
    render(
      <EntityListRow
        avatarFallbackIcon={<Store data-testid="fallback-icon" className="size-4" />}
        name="Main Store"
      />,
    );

    expect(screen.getByTestId("fallback-icon")).toBeDefined();
    expect(screen.queryByAltText("Main Store")).toBeNull();
  });

  it("renders the name, truncated via className, and the badges slot", () => {
    render(
      <EntityListRow
        avatarFallbackIcon={<Store className="size-4" />}
        name="Main Store"
        badges={<span>Editable</span>}
      />,
    );

    expect(screen.getByText("Main Store")).toBeDefined();
    expect(screen.getByText("Editable")).toBeDefined();
  });

  it("does not render an actions trigger when actions is omitted", () => {
    render(
      <EntityListRow avatarFallbackIcon={<Store className="size-4" />} name="Main Store" />,
    );

    expect(screen.queryByRole("button", { name: /actions for main store/i })).toBeNull();
  });

  it("renders the actions trigger and dispatches the action when provided", async () => {
    const onSelectAction = vi.fn();
    render(
      <EntityListRow
        avatarFallbackIcon={<Store className="size-4" />}
        name="Main Store"
        actions={[{ label: "Delete", variant: "destructive", onSelect: onSelectAction }]}
      />,
    );

    const { default: userEvent } = await import("@testing-library/user-event");
    await userEvent.click(screen.getByRole("button", { name: /actions for main store/i }));
    await userEvent.click(await screen.findByText("Delete"));

    expect(onSelectAction).toHaveBeenCalled();
  });

  it("marks the row selected with aria-pressed and the accent background", () => {
    render(
      <EntityListRow
        avatarFallbackIcon={<Store className="size-4" />}
        name="Main Store"
        selected
      />,
    );

    const button = screen.getByRole("button", { name: "Main Store" });
    expect(button.getAttribute("aria-pressed")).toBe("true");
    expect(button.parentElement?.className).toContain("bg-accent/60");
  });

  it("calls onSelect when the row is clicked", async () => {
    const onSelect = vi.fn();
    render(
      <EntityListRow
        avatarFallbackIcon={<Store className="size-4" />}
        name="Main Store"
        onSelect={onSelect}
      />,
    );

    const { default: userEvent } = await import("@testing-library/user-event");
    await userEvent.click(screen.getByRole("button", { name: "Main Store" }));

    expect(onSelect).toHaveBeenCalled();
  });
});
