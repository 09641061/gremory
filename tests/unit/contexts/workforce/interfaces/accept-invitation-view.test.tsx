/** @vitest-environment jsdom */

import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const mocks = {
  router: { replace: vi.fn(), refresh: vi.fn() },
};

vi.mock("next/navigation", () => ({ useRouter: () => mocks.router }));

import { AcceptInvitationView } from "@/contexts/workforce/interfaces/components/accept-invitation-view";

const organizationId = "11111111-1111-4111-8111-111111111111";
const establishmentId = "22222222-2222-4222-8222-222222222222";

const acceptanceBody = {
  invitation: {
    id: "33333333-3333-4333-8333-333333333333",
    organizationId,
    establishmentId,
    establishmentName: "Main",
    invitedEmail: "invited@example.com",
    invitedByUserId: "44444444-4444-4444-8444-444444444444",
    status: "ACCEPTED",
    expiresAt: "2026-02-01T00:00:00Z",
    acceptedByUserId: "55555555-5555-4555-8555-555555555555",
    acceptedAt: "2026-01-02T00:00:00Z",
    revokedAt: null,
    createdAt: "2026-01-01T00:00:00Z",
  },
  membership: {
    id: "66666666-6666-4666-8666-666666666666",
    userId: "55555555-5555-4555-8555-555555555555",
    email: "invited@example.com",
    organizationId,
    establishmentId,
    establishmentName: "Main",
    invitationId: "33333333-3333-4333-8333-333333333333",
    status: "ACTIVE",
    joinedAt: "2026-01-02T00:00:00Z",
    removedAt: null,
  },
  alreadyMember: false,
};

describe("AcceptInvitationView", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it("shows an error without a token and does not call the API", () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    render(<AcceptInvitationView token={null} />);

    expect(screen.getByText("Invalid invitation")).toBeVisible();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("posts the token and redirects to the team workspace on success", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(acceptanceBody), { status: 200 }),
    );
    vi.stubGlobal("fetch", fetchMock);

    render(<AcceptInvitationView token="raw-token" />);

    expect(screen.getByText("Processing your invitation")).toBeVisible();
    await waitFor(() => expect(mocks.router.replace).toHaveBeenCalledWith("/team"));
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/workforce/invitations/accept",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: "raw-token" }),
      }),
    );
  });

  it("renders the backend message when the token is invalid", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ message: "Invitation expired or unavailable" }), { status: 410 }),
      ),
    );

    render(<AcceptInvitationView token="expired-token" />);

    expect(await screen.findByText("Invitation expired or unavailable")).toBeVisible();
    expect(mocks.router.replace).not.toHaveBeenCalled();
  });
});
