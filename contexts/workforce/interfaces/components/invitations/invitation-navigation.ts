export function buildInvitationLandingHref(establishmentId: string): string {
  return `/?establishmentId=${encodeURIComponent(establishmentId)}`;
}
