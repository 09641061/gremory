import type {
  AcceptTeamInvitationCommand,
  InviteTeamUserCommand,
  RemoveTeamMemberCommand,
  RevokeTeamInvitationCommand,
} from "../../domain/model/commands/team.commands";
import type {
  ListTeamUsersQuery,
  PreviewTeamInvitationQuery,
} from "../../domain/model/queries/team.queries";
import type { InvitationId, MemberId } from "../../domain/model/valueobjects/team-identifiers.vo";
import type {
  TeamInvitationPreviewView,
  TeamAccessView,
  TeamPageView,
  TeamUserSummary,
} from "../model/team.read-models";

export interface TeamCommandService {
  invite(command: InviteTeamUserCommand): Promise<InvitationId>;
  revokeInvitation(command: RevokeTeamInvitationCommand): Promise<void>;
  removeMember(command: RemoveTeamMemberCommand): Promise<void>;
  acceptInvitation(command: AcceptTeamInvitationCommand): Promise<MemberId>;
  acceptPendingInvitation(): Promise<MemberId>;
}

export interface TeamQueryService {
  list(query?: ListTeamUsersQuery): Promise<TeamPageView<TeamUserSummary>>;
  getMyMembership(establishmentId?: string): Promise<TeamUserSummary | null>;
  getAccessContext(): Promise<TeamAccessView>;
  previewInvitation(
    query: PreviewTeamInvitationQuery,
  ): Promise<TeamInvitationPreviewView>;
}
