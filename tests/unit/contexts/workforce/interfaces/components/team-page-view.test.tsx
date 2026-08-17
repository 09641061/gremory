/** @vitest-environment jsdom */
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TeamPageView } from "@/contexts/workforce/interfaces/components/team/team-page-view";
import type { TeamUserSummary } from "@/contexts/workforce/application/model/team.read-models";

const routerPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: routerPush,
  }),
}));

describe("TeamPageView", () => {
  const member = {
    invitationId: "11111111-1111-4111-8111-111111111111",
    memberId: "22222222-2222-4222-8222-222222222222",
    userId: "33333333-3333-4333-8333-333333333333",
    name: "Alex Member",
    imageUrl: null,
    email: "alex@example.com",
    roleId: "44444444-4444-4444-8444-444444444444",
    roleName: "Worker",
    roles: [],
    organizationId: "55555555-5555-4555-8555-555555555555",
    establishmentId: "66666666-6666-4666-8666-666666666666",
    establishmentName: "Main location",
    status: "ACTIVE",
    hasAcceptedInvitation: true,
    canRevokeInvitation: false,
    canRemoveMembership: false,
    invitedAt: "2026-08-01T10:00:00Z",
    invitationExpiresAt: "2026-08-08T10:00:00Z",
    acceptedAt: "2026-08-02T10:00:00Z",
    joinedAt: "2026-08-02T10:00:00Z",
    removedAt: null,
    availableForScheduling: true,
    canUpdateSchedulingAvailability: true,
  } satisfies TeamUserSummary;

  const currentUser = {
    ...member,
    invitationId: null,
    memberId: "88888888-8888-4888-8888-888888888888",
    userId: "77777777-7777-4777-8777-777777777777",
    name: "Takodu",
    email: "takoduindustries@gmail.com",
    roleName: "Owner",
    roles: [
      {
        id: "owner",
        name: "Owner",
        position: 1,
        systemRole: true,
        permissions: [],
      },
    ],
    invitedAt: null,
    invitationExpiresAt: null,
    acceptedAt: null,
    joinedAt: null,
    removedAt: null,
    availableForScheduling: false,
    canUpdateSchedulingAvailability: false,
  } satisfies TeamUserSummary;

  it("marks the current user and disables scheduling when the backend denies it", () => {
    render(
      <TeamPageView
        establishmentId="66666666-6666-4666-8666-666666666666"
        members={[currentUser, member]}
        canManageRoles={true}
        canInviteMembers={true}
        canRemoveMembers={true}
        canCancelInvitations={true}
        currentUserId={currentUser.userId}
      />,
    );

    expect(screen.getByText("You")).toBeTruthy();
    expect(
      screen.getByText("Your owner membership cannot change scheduling availability from here."),
    ).toBeTruthy();
  });
});
