import { beforeEach, describe, expect, it, vi } from "vitest";
import { TeamApiError } from "@/contexts/workforce/infrastructure/gateways/team-api.gateway";

const mocks = vi.hoisted(() => ({
  redirect: vi.fn((href: string) => {
    throw new Error(`REDIRECT:${href}`);
  }),
  getTeamAccessToken: vi.fn(),
  previewInvitation: vi.fn(),
  acceptInvitation: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: mocks.redirect,
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/contexts/workforce/infrastructure/session/team-session", () => ({
  getTeamAccessToken: mocks.getTeamAccessToken,
}));

vi.mock("@/contexts/workforce/application/internal/queryservices/team-query.service", () => ({
  createTeamQueryService: () => ({
    previewInvitation: mocks.previewInvitation,
  }),
}));

vi.mock("@/contexts/workforce/application/internal/commandservices/team-command.service", () => ({
  createTeamCommandService: () => ({
    acceptInvitation: mocks.acceptInvitation,
  }),
}));

vi.mock("@/contexts/workforce/interfaces/components/invitations/invitation-acceptance-view", () => ({
  InvitationAcceptanceView: () => null,
  InvitationExpiredView: () => null,
  InvitationUnavailableView: () => null,
}));

import InvitationAcceptPage from "@/app/(public)/invitations/accept/page";

describe("InvitationAcceptPage", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("accepts a pending invitation immediately after sign-in and redirects to the establishment", async () => {
    mocks.getTeamAccessToken.mockResolvedValue("access-token");
    mocks.previewInvitation.mockResolvedValue({
      organizationId: "org-1",
      organizationName: "Takodu Studio",
      establishmentId: "est-1",
      establishmentName: "Miraflores",
      maskedEmail: "e***@example.com",
      status: "PENDING",
      expiresAt: "2026-08-01T10:00:00.000Z",
    });
    mocks.acceptInvitation.mockResolvedValue({ value: "member-1" });

    await expect(
      InvitationAcceptPage({
        searchParams: Promise.resolve({ token: "raw-token" }),
      }),
    ).rejects.toThrow("REDIRECT:/establishments?establishmentId=est-1");

    expect(mocks.acceptInvitation).toHaveBeenCalledWith({
      token: "raw-token",
    });
  });

  it("redirects to the establishment when the invitation was already handled by the backend", async () => {
    mocks.getTeamAccessToken.mockResolvedValue("access-token");
    mocks.previewInvitation.mockResolvedValue({
      organizationId: "org-1",
      organizationName: "Takodu Studio",
      establishmentId: "est-1",
      establishmentName: "Miraflores",
      maskedEmail: "e***@example.com",
      status: "PENDING",
      expiresAt: "2026-08-01T10:00:00.000Z",
    });
    mocks.acceptInvitation.mockRejectedValue(
      new TeamApiError("Invitation is no longer available", 410),
    );

    await expect(
      InvitationAcceptPage({
        searchParams: Promise.resolve({ token: "raw-token" }),
      }),
    ).rejects.toThrow("REDIRECT:/establishments?establishmentId=est-1");
  });
});
