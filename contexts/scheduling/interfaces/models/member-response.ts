/**
 * Lightweight member representation used in the scheduling context
 * for displaying employee/specialist info in appointment forms and details.
 * Mapped from TeamUserSummary in the schedule page.
 */
export interface MemberResponse {
  id: string;       // memberId from workforce context
  userId: string;   // userId from IAM (used as employeeId in scheduling_appointments FK)
  name: string;     // display name derived from email
  email: string;
  role: string;     // role name
  status: string;   // workforce user status
}
