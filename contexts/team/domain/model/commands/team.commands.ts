export type InviteTeamUserCommand = Readonly<{
  establishmentId: string;
  email: string;
}>;

export type RevokeTeamInvitationCommand = Readonly<{ invitationId: string }>;
export type RemoveTeamMemberCommand = Readonly<{ memberId: string }>;
export type AcceptTeamInvitationCommand = Readonly<{ token: string }>;

export function inviteTeamUserCommand(
  input: InviteTeamUserCommand,
): InviteTeamUserCommand {
  return Object.freeze({ ...input });
}

export function revokeTeamInvitationCommand(
  input: RevokeTeamInvitationCommand,
): RevokeTeamInvitationCommand {
  return Object.freeze({ ...input });
}

export function removeTeamMemberCommand(
  input: RemoveTeamMemberCommand,
): RemoveTeamMemberCommand {
  return Object.freeze({ ...input });
}

export function acceptTeamInvitationCommand(
  input: AcceptTeamInvitationCommand,
): AcceptTeamInvitationCommand {
  return Object.freeze({ ...input });
}
