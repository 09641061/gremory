/** @vitest-environment jsdom */
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { InviteCollaboratorForm } from "@/contexts/workforce/interfaces/components/invite-collaborator-form";

vi.mock("@/contexts/workforce/interfaces/actions/workforce.actions", () => ({
  inviteWorkforceMemberAction: vi.fn(),
}));

describe("InviteCollaboratorForm", () => {
  it("should show the establishment name while submitting its identifier", () => {
    render(
      <InviteCollaboratorForm
        organizationId="organization-id"
        establishments={[
          { id: "97a23e19-4a5e-48a3-8a40-6e0585df6b85", name: "Centro" },
        ]}
        roles={[
          { id: "67ba10be-b388-4caa-9cf0-bdd670cfa643", name: "Recepción" },
        ]}
      />,
    );

    expect(screen.getByRole("combobox", { name: "Establecimiento" })).toHaveTextContent("Centro");
    expect(screen.getByRole("combobox", { name: "Rol" })).toHaveTextContent("Recepción");
    expect(screen.queryByText("97a23e19-4a5e-48a3-8a40-6e0585df6b85")).not.toBeInTheDocument();
  });
});
