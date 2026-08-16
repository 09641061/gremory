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
  } satisfies TeamUserSummary;

  it("shows the edit establishment action when the backend allows it", () => {
    render(
      <TeamPageView
        establishmentId="66666666-6666-4666-8666-666666666666"
        members={[member]}
        canManageRoles={true}
        canInviteMembers={true}
        canRemoveMembers={true}
        canCancelInvitations={true}
        canEditEstablishmentProfile={true}
        establishmentEditHref="/establishments?establishmentId=66666666-6666-4666-8666-666666666666"
      />,
    );

    expect(screen.getByRole("button", { name: "Edit establishment" })).toBeDefined();
  });

  it("hides the edit establishment action when the backend denies it", () => {
    render(
      <TeamPageView
        establishmentId="66666666-6666-4666-8666-666666666666"
        members={[member]}
        canManageRoles={true}
        canInviteMembers={true}
        canRemoveMembers={true}
        canCancelInvitations={true}
        canEditEstablishmentProfile={false}
        establishmentEditHref="/establishments?establishmentId=66666666-6666-4666-8666-666666666666"
      />,
    );

    expect(screen.queryByRole("button", { name: "Edit establishment" })).toBeNull();
  });
});
