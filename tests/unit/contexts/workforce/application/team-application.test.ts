import { describe, expect, it, vi } from "vitest";
import { TeamCommandServiceImpl } from "@/contexts/workforce/application/internal/commandservices/team-command.service";
import { TeamQueryServiceImpl } from "@/contexts/workforce/application/internal/queryservices/team-query.service";
import { TeamUser } from "@/contexts/workforce/domain/model/entities/team-user.entity";
import { createInvitedEmail } from "@/contexts/workforce/domain/model/valueobjects/invited-email.vo";
import {
  createInvitationId,
  createMemberId,
  createTeamEstablishmentId,
  createTeamOrganizationId,
} from "@/contexts/workforce/domain/model/valueobjects/team-identifiers.vo";
import type { TeamRepository } from "@/contexts/workforce/domain/services/team.repository";

const invitationId = "11111111-1111-4111-8111-111111111111";
const memberId = "22222222-2222-4222-8222-222222222222";
const organizationId = "44444444-4444-4444-8444-444444444444";
const establishmentId = "55555555-5555-4555-8555-555555555555";

describe("Team application services", () => {
  it("should normalize invitation input before invoking repository", async () => {
    const repository = teamRepository();
    const invite = vi.spyOn(repository, "invite");

    const result = await new TeamCommandServiceImpl(repository).invite({
      establishmentId,
      email: " Employee@Example.COM ",
    });

    expect(invite).toHaveBeenCalledWith(
      createTeamEstablishmentId(establishmentId),
      createInvitedEmail("employee@example.com"),
    );
    expect(result.value).toBe(invitationId);
  });

  it("should not invoke repository when invitation input is invalid", async () => {
    const repository = teamRepository();
    const invite = vi.spyOn(repository, "invite");

    expect(() =>
      new TeamCommandServiceImpl(repository).invite({
        establishmentId: "invalid",
        email: "employee@example.com",
      }),
    ).toThrow("Establishment ID must be a valid UUID");
    expect(invite).not.toHaveBeenCalled();
  });

  it("should return serializable roster entries when listing team users", async () => {
    const repository = teamRepository();
    const list = vi.spyOn(repository, "list");

    const result = await new TeamQueryServiceImpl(repository).list({
      establishmentId,
      status: "PENDING" as const,
      page: 0,
      size: 20,
    });

    expect(list).toHaveBeenCalledWith({
      establishmentId: createTeamEstablishmentId(establishmentId),
      status: "PENDING",
      page: 0,
      size: 20,
    });
    expect(result.content).toEqual([
      expect.objectContaining({
        invitationId,
        memberId: null,
        email: "employee@example.com",
        status: "PENDING",
        canRevokeInvitation: true,
        canRemoveMembership: false,
      }),
    ]);
    expect(result.content[0]).not.toBeInstanceOf(TeamUser);
  });

  it("should return a serializable invitation preview", async () => {
    const result = await new TeamQueryServiceImpl(
      teamRepository(),
    ).previewInvitation({ token: "raw-token" });

    expect(result).toEqual({
      organizationId,
      organizationName: "Takodu Studio",
      establishmentId,
      establishmentName: "Miraflores",
      maskedEmail: "e***@example.com",
      status: "PENDING",
      expiresAt: "2026-08-01T10:00:00.000Z",
    });
  });
});

function teamRepository(): TeamRepository {
  return {
    list: vi.fn(async () => ({
      content: [pendingUser()],
      number: 0,
      size: 20,
      totalElements: 1,
      totalPages: 1,
      first: true,
      last: true,
      numberOfElements: 1,
      empty: false,
    })),
    invite: vi.fn(async () => createInvitationId(invitationId)),
    revokeInvitation: vi.fn(async () => undefined),
    removeMember: vi.fn(async () => undefined),
    previewInvitation: vi.fn(async () => ({
      organizationId: createTeamOrganizationId(organizationId),
      organizationName: "Takodu Studio",
      establishmentId: createTeamEstablishmentId(establishmentId),
      establishmentName: "Miraflores",
      maskedEmail: "e***@example.com",
      status: "PENDING" as const,
      expiresAt: new Date("2026-08-01T10:00:00Z"),
    })),
    acceptInvitation: vi.fn(async () => createMemberId(memberId)),
  };
}

function pendingUser() {
  return TeamUser.create({
    invitationId: createInvitationId(invitationId),
    memberId: null,
    userId: null,
    email: createInvitedEmail("employee@example.com"),
    organizationId: createTeamOrganizationId(organizationId),
    establishmentId: createTeamEstablishmentId(establishmentId),
    establishmentName: "Miraflores",
    status: "PENDING",
    invitedAt: new Date("2026-07-25T10:00:00Z"),
    invitationExpiresAt: new Date("2026-08-01T10:00:00Z"),
    acceptedAt: null,
    joinedAt: null,
    removedAt: null,
  });
}
