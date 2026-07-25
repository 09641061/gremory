import "server-only";

import type {
  AcceptTeamInvitationCommand,
  InviteTeamUserCommand,
  RemoveTeamMemberCommand,
  RevokeTeamInvitationCommand,
} from "../../../domain/model/commands/team.commands";
import { createInvitedEmail } from "../../../domain/model/valueobjects/invited-email.vo";
import { createInvitationToken } from "../../../domain/model/valueobjects/invitation-token.vo";
import {
  createInvitationId,
  createMemberId,
  createTeamEstablishmentId,
} from "../../../domain/model/valueobjects/team-identifiers.vo";
import type { TeamRepository } from "../../../domain/services/team.repository";
import { TeamApiGateway } from "../../../infrastructure/gateways/team-api.gateway";
import type { TeamCommandService } from "../../services/team.services";

export class TeamCommandServiceImpl implements TeamCommandService {
  constructor(private readonly team: TeamRepository) {}

  invite(command: InviteTeamUserCommand) {
    return this.team.invite(
      createTeamEstablishmentId(command.establishmentId),
      createInvitedEmail(command.email),
    );
  }

  revokeInvitation(command: RevokeTeamInvitationCommand) {
    return this.team.revokeInvitation(createInvitationId(command.invitationId));
  }

  removeMember(command: RemoveTeamMemberCommand) {
    return this.team.removeMember(createMemberId(command.memberId));
  }

  acceptInvitation(command: AcceptTeamInvitationCommand) {
    return this.team.acceptInvitation(createInvitationToken(command.token));
  }
}

export function createTeamCommandService(token?: string): TeamCommandService {
  return new TeamCommandServiceImpl(new TeamApiGateway(token));
}
