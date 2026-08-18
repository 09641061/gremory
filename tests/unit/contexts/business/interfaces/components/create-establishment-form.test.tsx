/** @vitest-environment jsdom */
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("@/contexts/business/interfaces/actions/establishment.actions", () => ({
  createEstablishmentAction: vi.fn(),
}));

vi.mock("react", async () => {
  const actual = await vi.importActual<typeof import("react")>("react");
  return {
    ...actual,
    useActionState: () => [
      { status: "idle", error: null, data: null },
      vi.fn(),
      false,
    ],
  };
});

import { CreateEstablishmentForm } from "@/contexts/business/interfaces/components/establishment/create-establishment/create-establishment-form";

describe("CreateEstablishmentForm", () => {
  it("renders the creation form", () => {
    render(<CreateEstablishmentForm organizationId="org-1" />);

    expect(screen.getByRole("heading", { name: "New establishment" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Create" })).toBeDefined();
  });
});
