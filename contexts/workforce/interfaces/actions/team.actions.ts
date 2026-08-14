"use server";

import { revalidatePath } from "next/cache";
import { createTeamCommandService } from "../../application/internal/commandservices/team-command.service";
import {
  acceptTeamInvitationCommand,
  inviteTeamUserCommand,
  removeTeamMemberCommand,
  revokeTeamInvitationCommand,
} from "../../domain/model/commands/team.commands";
import { requireTeamAccessToken } from "../../infrastructure/session/team-session";
import {
  invitationIdSchema,
  invitationTokenSchema,
  inviteTeamUserSchema,
  memberIdSchema,
} from "../rest/schemas/team.schemas";
import {
  teamActionError,
  type TeamActionResult,
} from "./team-action-result";

export async function inviteTeamUserAction(
  _previous: TeamActionResult,
  formData: FormData,
): Promise<TeamActionResult> {
  const parsed = inviteTeamUserSchema.safeParse({
    establishmentId: formData.get("establishmentId"),
    email: formData.get("email"),
  });
  if (!parsed.success) return teamActionError(parsed.error.issues[0]?.message);

  try {
    const service = createTeamCommandService(await requireTeamAccessToken());
    const invitationId = await service.invite(inviteTeamUserCommand(parsed.data));
    revalidateTeamView();
    return {
      status: "success",
      data: { invitationId: invitationId.value },
      error: null,
    };
  } catch (error) {
    return teamActionError(error);
  }
}

export async function revokeTeamInvitationAction(
  _previous: TeamActionResult,
  formData: FormData,
): Promise<TeamActionResult> {
  const parsed = invitationIdSchema.safeParse(formData.get("invitationId"));
  if (!parsed.success) return teamActionError(parsed.error.issues[0]?.message);

  try {
    const service = createTeamCommandService(await requireTeamAccessToken());
    await service.revokeInvitation(
      revokeTeamInvitationCommand({ invitationId: parsed.data }),
    );
    revalidateTeamView();
    return { status: "success", data: null, error: null };
  } catch (error) {
    return teamActionError(error);
  }
}

export async function removeTeamMemberAction(
  _previous: TeamActionResult,
  formData: FormData,
): Promise<TeamActionResult> {
  const parsed = memberIdSchema.safeParse(formData.get("memberId"));
  if (!parsed.success) return teamActionError(parsed.error.issues[0]?.message);

  try {
    const service = createTeamCommandService(await requireTeamAccessToken());
    await service.removeMember(removeTeamMemberCommand({ memberId: parsed.data }));
    revalidateTeamView();
    return { status: "success", data: null, error: null };
  } catch (error) {
    return teamActionError(error);
  }
}

export async function acceptTeamInvitationAction(
  _previous: TeamActionResult,
  formData: FormData,
): Promise<TeamActionResult> {
  const parsed = invitationTokenSchema.safeParse(formData.get("token"));
  if (!parsed.success) return teamActionError(parsed.error.issues[0]?.message);

  try {
    const service = createTeamCommandService(await requireTeamAccessToken());
    const memberId = await service.acceptInvitation(
      acceptTeamInvitationCommand({ token: parsed.data }),
    );
    revalidateTeamView();
    return {
      status: "success",
      data: { memberId: memberId.value },
      error: null,
    };
  } catch (error) {
    return teamActionError(error);
  }
}

/**
 * Accepts the invitation waiting for the authenticated account. Carries no token:
 * an account that registered through an invitation no longer holds the emailed link.
 */
export async function acceptPendingInvitationAction(
  previous: TeamActionResult,
): Promise<TeamActionResult> {
  void previous;
  try {
    const service = createTeamCommandService(await requireTeamAccessToken());
    const memberId = await service.acceptPendingInvitation();
    revalidateTeamView();
    return {
      status: "success",
      data: { memberId: memberId.value },
      error: null,
    };
  } catch (error) {
    return teamActionError(error);
  }
}

function revalidateTeamView() {
  revalidatePath("/team");
}
