/** @vitest-environment jsdom */
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

const replace = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
}));

vi.mock("@/contexts/workforce/interfaces/actions/team.actions", () => ({
  acceptPendingInvitationAction: vi.fn(),
}));

vi.mock("react", async () => {
  const actual = await vi.importActual<typeof import("react")>("react");
  return {
    ...actual,
    useActionState: () => [{ status: "success", error: null, data: null }, vi.fn(), false],
  };
});

import { PendingInvitationView } from "@/contexts/workforce/interfaces/components/invitations/pending-invitation-view";

describe("PendingInvitationView", () => {
  it("redirects to the establishment after accepting the pending invitation", () => {
    render(
      <PendingInvitationView
        invitation={{
          establishmentId: "55555555-5555-4555-8555-555555555555",
          organizationName: "Takodu Studio",
          establishmentName: "Miraflores",
          expiresAt: "2026-08-01T10:00:00.000Z",
        }}
      />,
    );

    expect(replace).toHaveBeenCalledWith(
      "/establishments?establishmentId=55555555-5555-4555-8555-555555555555",
    );
    expect(screen.getByText("You have been invited")).toBeVisible();
  });
});
