import type { WorkforceUserStatus } from "../enums/workforce-user-status";
import type { InvitedEmail } from "../valueobjects/invited-email.vo";
import type {
  InvitationId,
  MemberId,
  TeamEstablishmentId,
  TeamOrganizationId,
  TeamRoleId,
  TeamUserId,
} from "../valueobjects/team-identifiers.vo";

export interface TeamUserProps {
  invitationId: InvitationId;
  memberId: MemberId | null;
  userId: TeamUserId | null;
  name?: string | null;
  imageUrl?: string | null;
  email: InvitedEmail;
  roleId?: TeamRoleId | null;
  roleName?: string | null;
  isOwner?: boolean;
  roles?: ReadonlyArray<TeamRoleSummary>;
  organizationId: TeamOrganizationId;
  establishmentId: TeamEstablishmentId;
  establishmentName: string | null;
  status: WorkforceUserStatus;
  invitedAt: Date;
  invitationExpiresAt: Date;
  acceptedAt: Date | null;
  joinedAt: Date | null;
  removedAt: Date | null;
  availableForScheduling: boolean;
  canUpdateSchedulingAvailability: boolean;
}

export interface TeamRoleSummary {
  id: TeamRoleId;
  name: string;
  position: number;
  systemRole: boolean;
  permissions: ReadonlyArray<string>;
}

export class TeamUser {
  private constructor(
    public readonly invitationId: InvitationId,
    public readonly memberId: MemberId | null,
    public readonly userId: TeamUserId | null,
    public readonly name: string | null,
    public readonly imageUrl: string | null,
    public readonly email: InvitedEmail,
    public readonly roleId: TeamRoleId | null,
    public readonly roleName: string | null,
    public readonly isOwner: boolean,
    public readonly roles: ReadonlyArray<TeamRoleSummary>,
    public readonly organizationId: TeamOrganizationId,
    public readonly establishmentId: TeamEstablishmentId,
    public readonly establishmentName: string | null,
    public readonly status: WorkforceUserStatus,
    public readonly invitedAt: Date,
    public readonly invitationExpiresAt: Date,
    public readonly acceptedAt: Date | null,
    public readonly joinedAt: Date | null,
    public readonly removedAt: Date | null,
    public readonly availableForScheduling: boolean,
    public readonly canUpdateSchedulingAvailability: boolean,
  ) {}

  static create(props: TeamUserProps): TeamUser {
    if (
      (props.status === "ACTIVE" || props.status === "REMOVED") &&
      (!props.memberId || !props.userId)
    ) {
      throw new Error(`${props.status} team users require member and user IDs`);
    }
    if (Number.isNaN(props.invitedAt.getTime()) || Number.isNaN(props.invitationExpiresAt.getTime())) {
      throw new Error("Team user invitation dates must be valid");
    }
    const roles = props.roles ? [...props.roles] : [];
    const primaryRole = roles[0];
    return new TeamUser(
      props.invitationId,
      props.memberId,
      props.userId,
      normalizeName(props.name),
      normalizeImageUrl(props.imageUrl),
      props.email,
      primaryRole?.id ?? null,
      primaryRole ? primaryRole.name.trim() : null,
      props.isOwner ?? false,
      Object.freeze(roles),
      props.organizationId,
      props.establishmentId,
      normalizeEstablishmentName(props.establishmentName),
      props.status,
      props.invitedAt,
      props.invitationExpiresAt,
      props.acceptedAt,
      props.joinedAt,
      props.removedAt,
      props.availableForScheduling,
      props.canUpdateSchedulingAvailability,
    );
  }

  get hasAcceptedInvitation(): boolean {
    return this.status === "ACTIVE" || this.status === "REMOVED";
  }

  get canRevokeInvitation(): boolean {
    return this.status === "PENDING";
  }

  get canRemoveMembership(): boolean {
    return this.status === "ACTIVE" && this.memberId !== null;
  }
}

function normalizeEstablishmentName(value: string | null): string | null {
  if (value === null) return null;
  const normalized = value.trim();
  return normalized || null;
}

function normalizeName(value: string | null | undefined): string | null {
  if (value == null) return null;
  const normalized = value.trim();
  return normalized || null;
}

function normalizeImageUrl(value: string | null | undefined): string | null {
  if (value == null) return null;
  const normalized = value.trim();
  return normalized || null;
}
