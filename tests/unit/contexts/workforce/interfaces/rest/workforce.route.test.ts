import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  acceptWorkforceInvitationRoute,
  createWorkforceInvitationRoute,
  listWorkforceMembersRoute,
  previewWorkforceInvitationRoute,
  removeWorkforceMemberRoute,
  revokeWorkforceInvitationRoute,
  workforceAccessRoute,
} from "@/contexts/workforce/interfaces/rest/routes/workforce.route";
import {
  createInvitationId,
  createMemberId,
} from "@/contexts/workforce/domain/model/valueobjects/team-identifiers.vo";

const mocks = vi.hoisted(() => ({
  requireToken: vi.fn(),
  getToken: vi.fn(),
  commandServiceFactory: vi.fn(),
  queryServiceFactory: vi.fn(),
  commandService: {
    invite: vi.fn(),
    revokeInvitation: vi.fn(),
    removeMember: vi.fn(),
    acceptInvitation: vi.fn(),
  },
  queryService: {
    list: vi.fn(),
    previewInvitation: vi.fn(),
    getAccessContext: vi.fn(),
  },
}));

vi.mock("@/contexts/workforce/infrastructure/session/team-session", () => ({
  requireTeamAccessToken: mocks.requireToken,
  getTeamAccessToken: mocks.getToken,
}));

vi.mock(
  "@/contexts/workforce/application/internal/commandservices/team-command.service",
  () => ({
    createTeamCommandService: mocks.commandServiceFactory,
  }),
);

vi.mock(
  "@/contexts/workforce/application/internal/queryservices/team-query.service",
  () => ({
    createTeamQueryService: mocks.queryServiceFactory,
  }),
);

describe("workforce routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireToken.mockResolvedValue("access-token");
    mocks.getToken.mockResolvedValue(undefined);
    mocks.commandServiceFactory.mockReturnValue(mocks.commandService);
    mocks.queryServiceFactory.mockReturnValue(mocks.queryService);
    mocks.commandService.invite.mockResolvedValue(createInvitationId(INVITATION_ID));
    mocks.commandService.revokeInvitation.mockResolvedValue(undefined);
    mocks.commandService.removeMember.mockResolvedValue(undefined);
    mocks.commandService.acceptInvitation.mockResolvedValue(createMemberId(MEMBER_ID));
    mocks.queryService.list.mockResolvedValue(page);
    mocks.queryService.previewInvitation.mockResolvedValue(preview);
    mocks.queryService.getAccessContext.mockResolvedValue(access);
  });

  it("should list workforce members with validated query params", async () => {
    const response = await listWorkforceMembersRoute(
      new Request(
        "http://localhost/api/workforce/members?establishmentId=55555555-5555-4555-8555-555555555555&status=PENDING&page=0&size=20",
      ),
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(page);
    expect(mocks.requireToken).toHaveBeenCalledTimes(1);
    expect(mocks.queryService.list).toHaveBeenCalledWith({
      establishmentId: ESTABLISHMENT_ID,
      status: "PENDING",
      page: 0,
      size: 20,
    });
  });

  it("should reject invalid list query params", async () => {
    const response = await listWorkforceMembersRoute(
      new Request("http://localhost/api/workforce/members?page=-1"),
    );

    expect(response.status).toBe(400);
  });

  it("should create a workforce invitation", async () => {
    const response = await createWorkforceInvitationRoute(
      new Request("http://localhost/api/workforce/invitations", {
        method: "POST",
        body: JSON.stringify({
          establishmentId: ESTABLISHMENT_ID,
          email: "Employee@Example.com",
        }),
      }),
    );

    expect(response.status).toBe(201);
    expect(await response.json()).toEqual({ id: INVITATION_ID });
    expect(mocks.commandService.invite).toHaveBeenCalledWith({
      establishmentId: ESTABLISHMENT_ID,
      email: "Employee@Example.com",
    });
  });

  it("should preview an invitation without requiring authentication", async () => {
    const response = await previewWorkforceInvitationRoute(
      new Request("http://localhost/api/workforce/invitations/preview?token=raw-token"),
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(preview);
    expect(mocks.getToken).toHaveBeenCalledTimes(1);
    expect(mocks.queryService.previewInvitation).toHaveBeenCalledWith({
      token: "raw-token",
    });
  });

  it("should accept an invitation and return the membership identity", async () => {
    const response = await acceptWorkforceInvitationRoute(
      new Request("http://localhost/api/workforce/invitations/accept", {
        method: "POST",
        body: JSON.stringify({ token: "raw-token" }),
      }),
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ memberId: MEMBER_ID });
    expect(mocks.commandService.acceptInvitation).toHaveBeenCalledWith({
      token: "raw-token",
    });
  });

  it("should revoke an invitation", async () => {
    const response = await revokeWorkforceInvitationRoute(INVITATION_ID);

    expect(response.status).toBe(204);
    expect(mocks.commandService.revokeInvitation).toHaveBeenCalledWith({
      invitationId: INVITATION_ID,
    });
  });

  it("should remove a workforce member", async () => {
    const response = await removeWorkforceMemberRoute(MEMBER_ID);

    expect(response.status).toBe(204);
    expect(mocks.commandService.removeMember).toHaveBeenCalledWith({
      memberId: MEMBER_ID,
    });
  });

  it("should load workforce access context", async () => {
    const response = await workforceAccessRoute();

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(access);
  });
});

const INVITATION_ID = "11111111-1111-4111-8111-111111111111";
const MEMBER_ID = "22222222-2222-4222-8222-222222222222";
const ESTABLISHMENT_ID = "55555555-5555-4555-8555-555555555555";

const page = {
  content: [],
  number: 0,
  size: 20,
  totalElements: 0,
  totalPages: 0,
  first: true,
  last: true,
  numberOfElements: 0,
  empty: true,
};

const preview = {
  organizationId: "44444444-4444-4444-8444-444444444444",
  organizationName: "Takodu Studio",
  establishmentId: ESTABLISHMENT_ID,
  establishmentName: "Miraflores",
  maskedEmail: "e***@example.com",
  status: "PENDING",
  expiresAt: "2026-08-01T10:00:00.000Z",
};

const access = {
  active: true,
  establishments: [
    {
      organizationId: "44444444-4444-4444-8444-444444444444",
      organizationName: "Takodu Studio",
      establishmentId: ESTABLISHMENT_ID,
      establishmentName: "Miraflores",
    },
  ],
};
