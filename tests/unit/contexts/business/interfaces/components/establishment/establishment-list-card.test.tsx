/** @vitest-environment jsdom */
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { EstablishmentListCard } from "@/contexts/business/interfaces/components/establishment/establishments-page/establishment-list-card";
import type { EstablishmentListItem } from "@/contexts/business/interfaces/components/establishment/establishments-page/establishments-page";

const establishments: EstablishmentListItem[] = [
  { id: "est-1", name: "Main Store", photoUrl: null, timeZone: "America/Lima" },
  { id: "est-2", name: "Second Store", photoUrl: null, timeZone: "America/Lima" },
];

describe("EstablishmentListCard row actions menu", () => {
  it("renders a per-row actions (3 dots) menu with a Delete option when the row is deletable", async () => {
    render(
      <EstablishmentListCard
        establishments={establishments}
        filteredEstablishments={establishments}
        selectedEstId={null}
        canDeleteMap={{ "est-1": true, "est-2": false }}
        onSelect={vi.fn()}
        onDelete={vi.fn()}
      />,
    );

    // Row for est-1 (deletable) must expose a "More actions" trigger.
    const trigger = screen.getByRole("button", { name: /actions for main store/i });
    expect(trigger).toBeDefined();

    const { default: userEvent } = await import("@testing-library/user-event");
    await userEvent.click(trigger);

    expect(await screen.findByText("Delete")).toBeDefined();
  });

  it("does not render the actions menu for a row the user cannot delete", () => {
    render(
      <EstablishmentListCard
        establishments={establishments}
        filteredEstablishments={establishments}
        selectedEstId={null}
        canDeleteMap={{ "est-1": true, "est-2": false }}
        onSelect={vi.fn()}
        onDelete={vi.fn()}
      />,
    );

    expect(
      screen.queryByRole("button", { name: /actions for second store/i }),
    ).toBeNull();
  });

  it("invokes onDelete with the establishment id when Delete is confirmed", async () => {
    const onDelete = vi.fn();
    render(
      <EstablishmentListCard
        establishments={establishments}
        filteredEstablishments={establishments}
        selectedEstId={null}
        canDeleteMap={{ "est-1": true }}
        onSelect={vi.fn()}
        onDelete={onDelete}
      />,
    );

    const { default: userEvent } = await import("@testing-library/user-event");
    await userEvent.click(screen.getByRole("button", { name: /actions for main store/i }));
    await userEvent.click(await screen.findByText("Delete"));

    expect(onDelete).toHaveBeenCalledWith("est-1");
  });
});
