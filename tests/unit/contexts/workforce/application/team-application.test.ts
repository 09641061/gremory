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
  createTeamRoleId,
} from "@/contexts/workforce/domain/model/valueobjects/team-identifiers.vo";
import type { TeamRepository } from "@/contexts/workforce/domain/services/team.repository";

const invitationId = "11111111-1111-4111-8111-111111111111";
const memberId = "22222222-2222-4222-8222-222222222222";
const organizationId = "44444444-4444-4444-8444-444444444444";
const establishmentId = "55555555-5555-4555-8555-555555555555";
const roleId = "66666666-6666-4666-8666-666666666666";

describe("Team application services", () => {
  it("should normalize invitation input before invoking repository", async () => {
    const repository = teamRepository();
    const service = new TeamCommandServiceImpl(repository);

    const result = await service.invite({
      establishmentId,
      email: " User@Company.Com ",
    });

    expect(repository.invite).toHaveBeenCalledWith(
      createTeamEstablishmentId(establishmentId),
      createInvitedEmail("user@company.com"),
    );
    expect(result.value).toBe(invitationId);
  });

  it("should forward revocation command to repository", async () => {
    const repository = teamRepository();
    const service = new TeamCommandServiceImpl(repository);

    await service.revokeInvitation({ invitationId });

    expect(repository.revokeInvitation).toHaveBeenCalledWith(
      createInvitationId(invitationId),
    );
  });

  it("should forward membership removal command to repository", async () => {
    const repository = teamRepository();
    const service = new TeamCommandServiceImpl(repository);

    await service.removeMember({ memberId });

    expect(repository.removeMember).toHaveBeenCalledWith(
      createMemberId(memberId),
    );
  });

  it("should return serializable roster entries when listing team users", async () => {
    const repository = teamRepository();
    const service = new TeamQueryServiceImpl(repository);

    const result = await service.list({ establishmentId, page: 0, size: 20 });

    expect(repository.list).toHaveBeenCalledWith({
      establishmentId: createTeamEstablishmentId(establishmentId),
      page: 0,
      size: 20,
    });
    expect(result.content[0]).toEqual({
      invitationId,
      memberId: null,
      userId: null,
      email: "employee@example.com",
      roleId,
      roleName: "Everyone",
      organizationId,
      establishmentId,
      establishmentName: "Miraflores",
      status: "PENDING",
      hasAcceptedInvitation: false,
      canRevokeInvitation: true,
      canRemoveMembership: false,
      invitedAt: "2026-07-25T10:00:00.000Z",
      invitationExpiresAt: "2026-08-01T10:00:00.000Z",
      acceptedAt: null,
      joinedAt: null,
      removedAt: null,
    });
  });

  it("should forward token preview requests to repository", async () => {
    const repository = teamRepository();
    const service = new TeamQueryServiceImpl(repository);

    const result = await service.previewInvitation({ token: "abc-token" });

    expect(repository.previewInvitation).toHaveBeenCalledWith(
      expect.objectContaining({ value: "abc-token" }),
    );
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
    getAccessContext: vi.fn(async () => ({
      active: true,
      establishments: [],
    })),
  };
}

function pendingUser() {
  return TeamUser.create({
    invitationId: createInvitationId(invitationId),
    memberId: null,
    userId: null,
    email: createInvitedEmail("employee@example.com"),
    roleId: createTeamRoleId(roleId),
    roleName: "Everyone",
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
