import type { TeamUser } from "../model/entities/team-user.entity";
import type { WorkforceUserStatus } from "../model/enums/workforce-user-status";
import type { InvitedEmail } from "../model/valueobjects/invited-email.vo";
import type { InvitationToken } from "../model/valueobjects/invitation-token.vo";
import type {
  InvitationId,
  MemberId,
  TeamEstablishmentId,
  TeamOrganizationId,
  TeamUserId,
  TeamRoleId,
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
  status: "PENDING" | "ACCEPTED" | "REMOVED";
  expiresAt: Date;
}

export interface TeamAccessContext {
  active: boolean;
  membershipCapabilities?: Readonly<{
    canReadTeam?: boolean;
    canCreateInvitation?: boolean;
    canDeleteInvitation?: boolean;
    canUpdateRole?: boolean;
    canDeleteRole?: boolean;
    canEditEstablishmentProfile?: boolean;
    canOpenModules?: boolean;
    canReadAppointments?: boolean;
    canCreateAppointment?: boolean;
    canUpdateAppointment?: boolean;
    canDeleteAppointment?: boolean;
    canReadAnalytics?: boolean;
  }>;
  establishments: Array<{
    organizationId: TeamOrganizationId;
    organizationName: string;
    establishmentId: TeamEstablishmentId;
    establishmentName: string;
    roles: Array<{ id: string; name: string; position: number; systemRole: boolean }>;
    effectivePermissions: string[];
  }>;
}

export interface TeamMembershipContext {
  memberId: MemberId | null;
  userId: TeamUserId | null;
  organizationId: TeamOrganizationId;
  organizationName: string;
  establishmentId: TeamEstablishmentId;
  establishmentName: string;
  status: WorkforceUserStatus;
  roles: Array<{
    id: TeamRoleId;
    name: string;
    position: number;
    systemRole: boolean;
    permissions: string[];
  }>;
  isOwner: boolean;
  availableForScheduling: boolean;
  canUpdateSchedulingAvailability: boolean;
  username: string | null;
  imageUrl: string | null;
  email: InvitedEmail;
}

export interface TeamRepository {
  list(criteria: TeamUserCriteria): Promise<TeamPageResult<TeamUser>>;
  getMyMembership(establishmentId?: TeamEstablishmentId): Promise<TeamMembershipContext | null>;
  invite(
    establishmentId: TeamEstablishmentId,
    email: InvitedEmail,
  ): Promise<InvitationId>;
  revokeInvitation(invitationId: InvitationId): Promise<void>;
  removeMember(memberId: MemberId): Promise<void>;
  updateSchedulingAvailability?(memberId: MemberId, available: boolean): Promise<void>;
  previewInvitation(token: InvitationToken): Promise<TeamInvitationPreview>;
  acceptInvitation(token: InvitationToken): Promise<MemberId>;
  // For an account that registered through an invitation and no longer holds
  // the emailed link: the backend resolves it by the authenticated email.
  acceptPendingInvitation(): Promise<MemberId>;
  getAccessContext(): Promise<TeamAccessContext>;
}
