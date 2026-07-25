export const workforceUserStatuses = [
  "PENDING",
  "ACTIVE",
  "REMOVED",
  "EXPIRED",
] as const;

export type WorkforceUserStatus = (typeof workforceUserStatuses)[number];

export function isWorkforceUserStatus(value: string): value is WorkforceUserStatus {
  return workforceUserStatuses.includes(value as WorkforceUserStatus);
}
