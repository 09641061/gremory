/** @vitest-environment jsdom */
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { EstablishmentListCard } from "@/contexts/business/interfaces/components/establishment/establishments-page/establishment-list-card";

describe("EstablishmentListCard", () => {
  const establishments = [
    {
      id: "est-1",
      name: "Main location",
      photoUrl: null,
      timeZone: "America/Lima",
    },
    {
      id: "est-2",
      name: "Secondary location",
      photoUrl: null,
      timeZone: "America/Lima",
    },
  ];

  it("shows the editable marker when the backend allows updating the local", () => {
    render(
      <EstablishmentListCard
        establishments={establishments}
        filteredEstablishments={establishments}
        selectedEstId={null}
        canUpdateMap={{ "est-1": true, "est-2": false }}
        defaultCanUpdate={false}
        onSelect={vi.fn()}
      />,
    );

    expect(screen.getByText("Editable")).toBeDefined();
  });

  it("hides the editable marker when the backend denies updating the local", () => {
    render(
      <EstablishmentListCard
        establishments={establishments}
        filteredEstablishments={establishments}
        selectedEstId={null}
        canUpdateMap={{ "est-1": false, "est-2": false }}
        defaultCanUpdate={false}
        onSelect={vi.fn()}
      />,
    );

    expect(screen.queryByText("Editable")).toBeNull();
  });
});
