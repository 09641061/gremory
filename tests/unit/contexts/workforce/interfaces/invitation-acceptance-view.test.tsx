/** @vitest-environment jsdom */
import { render, screen } from "@testing-library/react";
import {
  InvitationAcceptanceView,
  InvitationUnavailableView,
} from "@/contexts/workforce/interfaces/components/invitation-acceptance-view";
import type { TeamInvitationPreviewView } from "@/contexts/workforce/application/model/team.read-models";

vi.mock("@/contexts/workforce/interfaces/actions/team.actions", () => ({
  acceptTeamInvitationAction: vi.fn(),
}));

const invitation: TeamInvitationPreviewView = {
  organizationId: "44444444-4444-4444-8444-444444444444",
  organizationName: "Takodu Studio",
  establishmentId: "55555555-5555-4555-8555-555555555555",
  establishmentName: "Miraflores",
  maskedEmail: "e***@example.com",
  status: "PENDING",
  expiresAt: "2026-08-01T10:00:00.000Z",
};

describe("Invitation acceptance view", () => {
  it("should show invitation details and sign-in link when user is unauthenticated", () => {
    render(
      <InvitationAcceptanceView
        token="raw-token"
        invitation={invitation}
        authenticated={false}
      />,
    );

    expect(screen.getByRole("heading", { name: "Join the team" })).toBeVisible();
    expect(screen.getByText("Takodu Studio")).toBeVisible();
    expect(screen.getByText("Miraflores")).toBeVisible();
    expect(screen.queryByText("e***@example.com")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Sign in to accept" })).toHaveAttribute(
      "href",
      "/login?next=%2Finvitations%2Faccept%3Ftoken%3Draw-token",
    );
    expect(screen.queryByRole("button", { name: "Accept invitation" })).not.toBeInTheDocument();
  });

  it("should allow acceptance when user is authenticated", () => {
    render(
      <InvitationAcceptanceView
        token="raw-token"
        invitation={invitation}
        authenticated
      />,
    );

    expect(screen.getByRole("button", { name: "Accept invitation" })).toBeEnabled();
    expect(screen.queryByRole("link", { name: "Sign in to accept" })).not.toBeInTheDocument();
  });

  it("should explain when invitation cannot be used", () => {
    render(<InvitationUnavailableView />);

    expect(
      screen.getByRole("heading", { name: "Invitation unavailable" }),
    ).toBeVisible();
    expect(
      screen.getByText("This invitation is invalid, expired, or no longer available."),
    ).toBeVisible();
  });

  it("should show an accepted invitation as expired when its link is reused", () => {
    render(
      <InvitationAcceptanceView
        token="accepted-token"
        invitation={{ ...invitation, status: "ACCEPTED" }}
        authenticated
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Invitation expired" }),
    ).toBeVisible();
    expect(
      screen.getByText("This invitation has already been used and is no longer available."),
    ).toBeVisible();
    expect(screen.queryByRole("button", { name: "Accept invitation" })).not.toBeInTheDocument();
  });

  it("should explain when membership was removed after acceptance", () => {
    render(
      <InvitationAcceptanceView
        token="removed-token"
        invitation={{ ...invitation, status: "REMOVED" }}
        authenticated
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Workspace access removed" }),
    ).toBeVisible();
    expect(
      screen.getByText(
        "Your membership is no longer active. Ask the organization owner to send you a new invitation.",
      ),
    ).toBeVisible();
    expect(screen.queryByRole("link", { name: "Continue to Takodu" })).not.toBeInTheDocument();
  });
});
