import type { WorkforceUserStatus } from "../../domain/model/enums/workforce-user-status";

export interface TeamUserSummary {
  invitationId: string;
  memberId: string | null;
  userId: string | null;
  email: string;
  role: string | null;
  organizationId: string;
  establishmentId: string;
  establishmentName: string | null;
  status: WorkforceUserStatus;
  hasAcceptedInvitation: boolean;
  canRevokeInvitation: boolean;
  canRemoveMembership: boolean;
  invitedAt: string;
  invitationExpiresAt: string;
  acceptedAt: string | null;
  joinedAt: string | null;
  removedAt: string | null;
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
