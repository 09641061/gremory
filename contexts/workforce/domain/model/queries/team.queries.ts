import type { WorkforceUserStatus } from "../enums/workforce-user-status";

export type ListTeamUsersQuery = Readonly<{
  establishmentId?: string;
  status?: WorkforceUserStatus;
  page?: number;
  size?: number;
}>;

export type PreviewTeamInvitationQuery = Readonly<{ token: string }>;

export function listTeamUsersQuery(
  input: ListTeamUsersQuery = {},
): ListTeamUsersQuery {
  const page = input.page ?? 0;
  const size = input.size ?? 20;
  if (!Number.isInteger(page) || page < 0) {
    throw new Error("Page must be a non-negative integer");
  }
  if (!Number.isInteger(size) || size < 1 || size > 100) {
    throw new Error("Page size must be between 1 and 100");
  }
  return Object.freeze({ ...input, page, size });
}

export function previewTeamInvitationQuery(
  input: PreviewTeamInvitationQuery,
): PreviewTeamInvitationQuery {
  return Object.freeze({ ...input });
}
