import type { TeamUser } from "../model/entities/team-user.entity";
import type { WorkforceUserStatus } from "../model/enums/workforce-user-status";
import type { InvitedEmail } from "../model/valueobjects/invited-email.vo";
import type { InvitationToken } from "../model/valueobjects/invitation-token.vo";
import type {
  InvitationId,
  MemberId,
  TeamEstablishmentId,
  TeamOrganizationId,
} from "../model/valueobjects/team-identifiers.vo";

export interface TeamPageResult<T> {
  content: T[];
  number: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
  empty: boolean;
}

export interface TeamUserCriteria {
  establishmentId?: TeamEstablishmentId;
  status?: WorkforceUserStatus;
  page: number;
  size: number;
}

export interface TeamInvitationPreview {
  organizationId: TeamOrganizationId;
  organizationName: string;
  establishmentId: TeamEstablishmentId;
  establishmentName: string;
  maskedEmail: string;
  status: "PENDING";
  expiresAt: Date;
}

export interface TeamRepository {
  list(criteria: TeamUserCriteria): Promise<TeamPageResult<TeamUser>>;
  invite(
    establishmentId: TeamEstablishmentId,
    email: InvitedEmail,
  ): Promise<InvitationId>;
  revokeInvitation(invitationId: InvitationId): Promise<void>;
  removeMember(memberId: MemberId): Promise<void>;
  previewInvitation(token: InvitationToken): Promise<TeamInvitationPreview>;
  acceptInvitation(token: InvitationToken): Promise<MemberId>;
}
