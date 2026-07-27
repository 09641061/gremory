import type { WorkforceUserStatus } from "../../../domain/model/enums/workforce-user-status";

export interface WorkforceUserResource {
  invitationId: string;
  memberId: string | null;
  userId: string | null;
  email: string;
  roleId: string;
  roleName: string;
  organizationId: string;
  establishmentId: string;
  establishmentName: string | null;
  status: WorkforceUserStatus;
  invitedAt: string;
  invitationExpiresAt: string;
  acceptedAt: string | null;
  joinedAt: string | null;
  removedAt: string | null;
}

export interface TeamPageResource<T> {
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

export interface InvitationCreatedResource {
  id: string;
}

export interface InvitationPreviewResource {
  organizationId: string;
  organizationName: string;
  establishmentId: string;
  establishmentName: string;
  maskedEmail: string;
  status: "PENDING" | "ACCEPTED" | "REMOVED";
  expiresAt: string;
}

export interface InvitationAcceptanceResource {
  membership: {
    id: string;
  };
  alreadyMember: boolean;
}

export interface WorkforceAccessResource {
  active: boolean;
  establishments: Array<{
    organizationId: string;
    organizationName: string;
    establishmentId: string;
    establishmentName: string;
  }>;
}
