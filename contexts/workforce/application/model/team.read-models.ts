import type { WorkforceUserStatus } from "../../domain/model/enums/workforce-user-status";

export interface TeamUserSummary {
  invitationId: string | null;
  memberId: string | null;
  userId: string | null;
  name: string | null;
  imageUrl: string | null;
  email: string;
  roleId: string;
  roleName: string;
  isOwner?: boolean;
  roles: ReadonlyArray<{
    id: string;
    name: string;
    position: number;
    systemRole: boolean;
    permissions: ReadonlyArray<string>;
  }>;
  organizationId: string;
  establishmentId: string;
  establishmentName: string | null;
  status: WorkforceUserStatus;
  hasAcceptedInvitation: boolean;
  canRevokeInvitation: boolean;
  canRemoveMembership: boolean;
  invitedAt: string | null;
  invitationExpiresAt: string | null;
  acceptedAt: string | null;
  joinedAt: string | null;
  removedAt: string | null;
  availableForScheduling: boolean;
  canUpdateSchedulingAvailability: boolean;
}

export interface TeamInvitationPreviewView {
  organizationId: string;
  organizationName: string;
  establishmentId: string;
  establishmentName: string;
  maskedEmail: string;
  status: "PENDING" | "ACCEPTED" | "REMOVED";
  expiresAt: string;
}

export interface TeamAccessView {
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
    organizationId: string;
    organizationName: string;
    establishmentId: string;
    establishmentName: string;
    roles: ReadonlyArray<{ id: string; name: string; position: number; systemRole: boolean }>;
    effectivePermissions: ReadonlyArray<string>;
  }>;
}

export interface TeamPageView<T> {
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
