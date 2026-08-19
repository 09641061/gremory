import { afterEach, describe, expect, it, vi } from "vitest";
import { TeamApiGateway } from "@/contexts/workforce/infrastructure/gateways/team-api.gateway";
import { createInvitedEmail } from "@/contexts/workforce/domain/model/valueobjects/invited-email.vo";
import { createInvitationToken } from "@/contexts/workforce/domain/model/valueobjects/invitation-token.vo";
import {
  createInvitationId,
  createMemberId,
  createTeamEstablishmentId,
} from "@/contexts/workforce/domain/model/valueobjects/team-identifiers.vo";

const invitationId = "11111111-1111-4111-8111-111111111111";
const memberId = "22222222-2222-4222-8222-222222222222";
const userId = "33333333-3333-4333-8333-333333333333";
const organizationId = "44444444-4444-4444-8444-444444444444";
const establishmentId = "55555555-5555-4555-8555-555555555555";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("TeamApiGateway", () => {
  it("should list and map pending team users when API response is valid", async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(pageResource()));
    vi.stubGlobal("fetch", fetchMock);

    const result = await new TeamApiGateway("access-token").list({
      establishmentId: createTeamEstablishmentId(establishmentId),
      status: "PENDING",
      page: 1,
      size: 10,
    });

    expect(fetchMock).toHaveBeenCalledWith(
      `http://localhost:8080/api/workforce/members?page=1&size=10&establishmentId=${establishmentId}&status=PENDING`,
      expect.objectContaining({
        method: "GET",
        headers: { Authorization: "Bearer access-token" },
      }),
    );
    expect(result.content[0]?.status).toBe("PENDING");
    expect(result.content[0]?.canRevokeInvitation).toBe(true);
  });

  it("should send normalized invitation data with authentication", async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ id: invitationId }, 201));
    vi.stubGlobal("fetch", fetchMock);

    const result = await new TeamApiGateway("access-token").invite(
      createTeamEstablishmentId(establishmentId),
      createInvitedEmail(" Employee@Example.com "),
    );

    expect(result.value).toBe(invitationId);
    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:8080/api/workforce/invitations",
      expect.objectContaining({
        method: "POST",
        headers: {
          Authorization: "Bearer access-token",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          establishmentId,
          email: "employee@example.com",
        }),
      }),
    );
  });

  it("should preview invitation without sending authorization", async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({
      organizationId,
      organizationName: "Takodu Studio",
      establishmentId,
      establishmentName: "Miraflores",
      maskedEmail: "e***@example.com",
      status: "PENDING",
      expiresAt: "2026-08-01T10:00:00Z",
    }));
    vi.stubGlobal("fetch", fetchMock);

    const result = await new TeamApiGateway().previewInvitation(
      createInvitationToken("raw token"),
    );

    expect(result.maskedEmail).toBe("e***@example.com");
    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:8080/api/workforce/invitations/preview?token=raw+token",
      { cache: "no-store", method: "GET" },
    );
  });

  it("should preview an accepted invitation with authentication", async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({
      organizationId,
      organizationName: "Takodu Studio",
      establishmentId,
      establishmentName: "Miraflores",
      maskedEmail: "e***@example.com",
      status: "ACCEPTED",
      expiresAt: "2026-08-01T10:00:00Z",
    }));
    vi.stubGlobal("fetch", fetchMock);

    const result = await new TeamApiGateway("access-token").previewInvitation(
      createInvitationToken("accepted-token"),
    );

    expect(result.status).toBe("ACCEPTED");
    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:8080/api/workforce/invitations/preview?token=accepted-token",
      expect.objectContaining({
        headers: { Authorization: "Bearer access-token" },
      }),
    );
  });

  it("should accept invitation and return membership identity", async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({
      membership: { id: memberId },
      alreadyMember: false,
    }));
    vi.stubGlobal("fetch", fetchMock);

    const result = await new TeamApiGateway("access-token").acceptInvitation(
      createInvitationToken("raw-token"),
    );

    expect(result.value).toBe(memberId);
    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:8080/api/workforce/invitations/accept",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ token: "raw-token" }),
      }),
    );
  });

  it("should load member organization and establishment access", async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({
      active: true,
      membershipCapabilities: {
        canReadTeam: true,
        canOpenModules: true,
        canEditEstablishmentProfile: false,
      },
      establishments: [{
        organizationId,
        organizationName: "Naari",
        establishmentId,
        establishmentName: "Main location",
      }],
    }));
    vi.stubGlobal("fetch", fetchMock);

    const result = await new TeamApiGateway("access-token").getAccessContext();

    expect(result.active).toBe(true);
    expect(result.membershipCapabilities?.canOpenModules).toBe(true);
    expect(result.establishments[0]?.organizationId.value).toBe(organizationId);
    expect(result.establishments[0]?.establishmentId.value).toBe(establishmentId);
    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:8080/api/workforce/access",
      expect.objectContaining({
        method: "GET",
        headers: { Authorization: "Bearer access-token" },
      }),
    );
  });

  it("should target invitation and membership identifiers for each delete", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));
    vi.stubGlobal("fetch", fetchMock);
    const gateway = new TeamApiGateway("access-token");

    await gateway.revokeInvitation(createInvitationId(invitationId));
    await gateway.removeMember(createMemberId(memberId));

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      `http://localhost:8080/api/workforce/invitations/${invitationId}`,
      expect.objectContaining({ method: "DELETE" }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      `http://localhost:8080/api/workforce/members/${memberId}`,
      expect.objectContaining({ method: "DELETE" }),
    );
  });

  it("should reject an active user when API omits membership identity", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse(pageResource({
      status: "ACTIVE",
      memberId: null,
      userId,
    }))));

    await expect(new TeamApiGateway("access-token").list({
      page: 0,
      size: 20,
    })).rejects.toThrow("ACTIVE team users require member and user IDs");
  });

  it("should keep a member with no roles as role-less", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse(pageResource({
      roles: [],
    }))));

    const result = await new TeamApiGateway("access-token").list({
      page: 0,
      size: 20,
    });

    expect(result.content[0]?.roles).toHaveLength(0);
    expect(result.content[0]?.roleName).toBeNull();
    expect(result.content[0]?.roleId).toBeNull();
  });
});

function pageResource(overrides: Record<string, unknown> = {}) {
  return {
    content: [{
      invitationId,
      memberId: null,
      userId: null,
      email: "employee@example.com",
      roles: [],
      organizationId,
      establishmentId,
      establishmentName: "Miraflores",
      status: "PENDING",
      invitedAt: "2026-07-25T10:00:00Z",
      invitationExpiresAt: "2026-08-01T10:00:00Z",
      acceptedAt: null,
      joinedAt: null,
      removedAt: null,
      ...overrides,
    }],
    number: 0,
    size: 20,
    totalElements: 1,
    totalPages: 1,
    first: true,
    last: true,
    numberOfElements: 1,
    empty: false,
  };
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
