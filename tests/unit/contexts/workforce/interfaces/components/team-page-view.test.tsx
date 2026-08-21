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

const switches = () =>
  screen.getAllByRole("switch").map((el) => ({
    el,
    disabled: el.getAttribute("data-disabled") !== null,
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
    roles: [
      {
        id: "44444444-4444-4444-8444-444444444444",
        name: "Worker",
        position: 1,
        systemRole: false,
        permissions: [],
      },
    ],
    isOwner: false,
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
        id: "99999999-9999-4999-8999-999999999999",
        name: "Owner",
        position: 1,
        systemRole: true,
        permissions: [],
      },
    ],
    isOwner: true,
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
  });

  it("enables the owner to edit its own availability and everyone else's", () => {
    render(
      <TeamPageView
        establishmentId="66666666-6666-4666-8666-666666666666"
        members={[currentUser, member]}
        canManageRoles={true}
        canInviteMembers={true}
        canRemoveMembers={true}
        canCancelInvitations={true}
        currentUserId={currentUser.userId}
        currentUserIsOwner={true}
        canManageOwnAvailability={true}
        canManageOtherAvailability={true}
        canManageScheduling={true}
      />,
    );

    const all = switches();
    expect(all).toHaveLength(4);
    expect(all.every(({ disabled }) => disabled === false)).toBe(true);
  });

  it("prevents a non-owner from editing the owner's availability", () => {
    render(
      <TeamPageView
        establishmentId="66666666-6666-4666-8666-666666666666"
        members={[currentUser, member]}
        canManageRoles={true}
        canInviteMembers={true}
        canRemoveMembers={true}
        canCancelInvitations={true}
        currentUserId={member.userId}
        currentUserIsOwner={false}
        canManageOwnAvailability={true}
        canManageOtherAvailability={true}
      />,
    );

    const all = switches();
    expect(all).toHaveLength(4);
    // The worker can edit its own row (manage_self) and others' (manage_all),
    // but never the owner's row.
    expect(all[0].disabled).toBe(true);
    expect(all[1].disabled).toBe(true);
    expect(all[2].disabled).toBe(false);
    expect(all[3].disabled).toBe(true);
  });

  it("lets a worker with manage_self edit only its own availability", () => {
    render(
      <TeamPageView
        establishmentId="66666666-6666-4666-8666-666666666666"
        members={[currentUser, member]}
        canManageRoles={true}
        canInviteMembers={true}
        canRemoveMembers={true}
        canCancelInvitations={true}
        currentUserId={member.userId}
        currentUserIsOwner={false}
        canManageOwnAvailability={true}
        canManageOtherAvailability={false}
      />,
    );

    const all = switches();
    expect(all).toHaveLength(4);
    expect(all[0].disabled).toBe(true);
    expect(all[1].disabled).toBe(true);
    expect(all[2].disabled).toBe(false);
    expect(all[3].disabled).toBe(true);
  });
});
