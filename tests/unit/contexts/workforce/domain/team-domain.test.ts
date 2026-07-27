import { describe, expect, it } from "vitest";
import { TeamUser } from "@/contexts/workforce/domain/model/entities/team-user.entity";
import { listTeamUsersQuery } from "@/contexts/workforce/domain/model/queries/team.queries";
import { createInvitedEmail } from "@/contexts/workforce/domain/model/valueobjects/invited-email.vo";
import {
  createInvitationId,
  createMemberId,
  createTeamEstablishmentId,
  createTeamOrganizationId,
  createTeamRoleId,
  createTeamUserId,
} from "@/contexts/workforce/domain/model/valueobjects/team-identifiers.vo";

const invitationId = "11111111-1111-4111-8111-111111111111";
const memberId = "22222222-2222-4222-8222-222222222222";
const userId = "33333333-3333-4333-8333-333333333333";
const organizationId = "44444444-4444-4444-8444-444444444444";
const establishmentId = "55555555-5555-4555-8555-555555555555";
const roleId = "66666666-6666-4666-8666-666666666666";

describe("Team domain", () => {
  it("should normalize an invited email when input is valid", () => {
    const email = createInvitedEmail(" Employee@Example.COM ");

    expect(email.value).toBe("employee@example.com");
    expect(Object.isFrozen(email)).toBe(true);
  });

  it("should reject an invited email when input is malformed", () => {
    expect(() => createInvitedEmail("not-an-email")).toThrow(
      "A valid invited email is required",
    );
  });

  it("should identify available actions when invitation is pending", () => {
    const user = teamUser("PENDING");

    expect(user.hasAcceptedInvitation).toBe(false);
    expect(user.canRevokeInvitation).toBe(true);
    expect(user.canRemoveMembership).toBe(false);
  });

  it("should identify available actions when membership is active", () => {
    const user = teamUser("ACTIVE");

    expect(user.hasAcceptedInvitation).toBe(true);
    expect(user.canRevokeInvitation).toBe(false);
    expect(user.canRemoveMembership).toBe(true);
  });

  it("should reject an active team user without membership identity", () => {
    expect(() =>
      TeamUser.create({
        ...baseProps(),
        status: "ACTIVE",
        memberId: null,
        userId: null,
      }),
    ).toThrow("ACTIVE team users require member and user IDs");
  });

  it("should reject pagination when page size exceeds the API limit", () => {
    expect(() => listTeamUsersQuery({ size: 101 })).toThrow(
      "Page size must be between 1 and 100",
    );
  });
});

function teamUser(status: "PENDING" | "ACTIVE") {
  return TeamUser.create({
    ...baseProps(),
    status,
    memberId: status === "ACTIVE" ? createMemberId(memberId) : null,
    userId: status === "ACTIVE" ? createTeamUserId(userId) : null,
    acceptedAt: status === "ACTIVE" ? new Date("2026-07-25T11:00:00Z") : null,
    joinedAt: status === "ACTIVE" ? new Date("2026-07-25T11:00:00Z") : null,
  });
}

function baseProps() {
  return {
    invitationId: createInvitationId(invitationId),
    memberId: null,
    userId: null,
    email: createInvitedEmail("employee@example.com"),
    roleId: createTeamRoleId(roleId),
    roleName: "Everyone",
    organizationId: createTeamOrganizationId(organizationId),
    establishmentId: createTeamEstablishmentId(establishmentId),
    establishmentName: "Miraflores",
    status: "PENDING" as const,
    invitedAt: new Date("2026-07-25T10:00:00Z"),
    invitationExpiresAt: new Date("2026-08-01T10:00:00Z"),
    acceptedAt: null,
    joinedAt: null,
    removedAt: null,
  };
}
