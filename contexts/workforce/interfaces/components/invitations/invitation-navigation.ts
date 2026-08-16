export function buildInvitationLandingHref(establishmentId: string): string {
  return `/establishments?establishmentId=${encodeURIComponent(establishmentId)}`;
}
