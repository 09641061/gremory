const mocks = vi.hoisted(() => ({
  revalidatePath: vi.fn(),
  requireToken: vi.fn(),
  serviceFactory: vi.fn(),
  service: {
    invite: vi.fn(),
    revokeInvitation: vi.fn(),
    removeMember: vi.fn(),
    acceptInvitation: vi.fn(),
    acceptPendingInvitation: vi.fn(),
  },
}));

vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));
vi.mock("@/contexts/workforce/infrastructure/session/team-session", () => ({
  requireTeamAccessToken: mocks.requireToken,
}));
vi.mock(
  "@/contexts/workforce/application/internal/commandservices/team-command.service",
  () => ({ createTeamCommandService: mocks.serviceFactory }),
);
vi.mock(
  "@/contexts/business/application/internal/queryservices/business-workspace-query.service",
  () => ({
    createBusinessWorkspaceQueryService: () => ({
      getHeaderViewModel: vi.fn().mockResolvedValue({ organization: { id: "44444444-4444-4444-8444-444444444444" } }),
    }),
  }),
);

import {
  acceptTeamInvitationAction,
  acceptPendingInvitationAction,
  inviteTeamUserAction,
  removeTeamMemberAction,
  revokeTeamInvitationAction,
} from "@/contexts/workforce/interfaces/actions/team.actions";
import { initialTeamActionResult } from "@/contexts/workforce/interfaces/actions/team-action-result";
import {
  createInvitationId,
  createMemberId,
} from "@/contexts/workforce/domain/model/valueobjects/team-identifiers.vo";
import { TeamApiError } from "@/contexts/workforce/infrastructure/gateways/team-api.gateway";

const invitationId = "11111111-1111-4111-8111-111111111111";
const memberId = "22222222-2222-4222-8222-222222222222";
const establishmentId = "55555555-5555-4555-8555-555555555555";

describe("Team server actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireToken.mockResolvedValue("access-token");
    mocks.serviceFactory.mockReturnValue(mocks.service);
    mocks.service.invite.mockResolvedValue(createInvitationId(invitationId));
    mocks.service.revokeInvitation.mockResolvedValue(undefined);
    mocks.service.removeMember.mockResolvedValue(undefined);
    mocks.service.acceptInvitation.mockResolvedValue(createMemberId(memberId));
    mocks.service.acceptPendingInvitation.mockResolvedValue(createMemberId(memberId));
  });

  it("should not invoke service when invitation form is invalid", async () => {
    const result = await inviteTeamUserAction(
      initialTeamActionResult,
      form({ establishmentId: "invalid", email: "invalid" }),
    );

    expect(result.status).toBe("error");
    expect(mocks.serviceFactory).not.toHaveBeenCalled();
  });

  it("should invite a user and revalidate team when form is valid", async () => {
    const result = await inviteTeamUserAction(
      initialTeamActionResult,
      form({
        establishmentId,
        email: " Employee@Example.com ",
      }),
    );

    expect(mocks.serviceFactory).toHaveBeenCalledWith(
      "access-token",
      "44444444-4444-4444-8444-444444444444",
    );
    expect(mocks.service.invite).toHaveBeenCalledWith({
      establishmentId,
      email: "Employee@Example.com",
    });
    expect(result).toEqual({
      status: "success",
      data: { invitationId },
      error: null,
    });
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/team");
  });

  it("should use invitation identity when revoking pending user", async () => {
    const result = await revokeTeamInvitationAction(
      initialTeamActionResult,
      form({ invitationId }),
    );

    expect(mocks.service.revokeInvitation).toHaveBeenCalledWith({ invitationId });
    expect(result.status).toBe("success");
  });

  it("should use membership identity when removing active user", async () => {
    const result = await removeTeamMemberAction(
      initialTeamActionResult,
      form({ memberId }),
    );

    expect(mocks.service.removeMember).toHaveBeenCalledWith({ memberId });
    expect(result.status).toBe("success");
  });

  it("should accept invitation and expose created membership identity", async () => {
    const result = await acceptTeamInvitationAction(
      initialTeamActionResult,
      form({ token: "raw-token" }),
    );

    expect(mocks.service.acceptInvitation).toHaveBeenCalledWith({
      token: "raw-token",
    });
    expect(result).toEqual({
      status: "success",
      data: { memberId },
      error: null,
    });
  });

  it("should tolerate an already-handled pending invitation and still succeed", async () => {
    mocks.service.acceptPendingInvitation.mockRejectedValue(
      new TeamApiError("Invitation is no longer available", 410),
    );

    const result = await acceptPendingInvitationAction(initialTeamActionResult);

    expect(result).toEqual({
      status: "success",
      data: null,
      error: null,
    });
  });

  it("should return authentication error without invoking command", async () => {
    mocks.requireToken.mockRejectedValue(new Error("Authentication is required"));

    const result = await removeTeamMemberAction(
      initialTeamActionResult,
      form({ memberId }),
    );

    expect(result).toEqual({
      status: "error",
      data: null,
      error: "Authentication is required",
    });
    expect(mocks.service.removeMember).not.toHaveBeenCalled();
  });
});

function form(values: Record<string, string>) {
  const formData = new FormData();
  for (const [key, value] of Object.entries(values)) {
    formData.set(key, value);
  }
  return formData;
}
