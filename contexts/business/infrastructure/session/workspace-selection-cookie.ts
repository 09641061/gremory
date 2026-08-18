/**
 * Remembers which establishment the account was last working in. The
 * `establishmentId` query string is the source of truth for a single
 * navigation, but nothing persisted it beyond that: a link that forgot to
 * carry it forward, or the browser's own back/forward history, silently
 * dropped the account back onto its default organization. This cookie is the
 * fallback the Proxy reads when the URL itself carries no selection.
 */
export const workspaceSelectionCookies = {
  establishmentId: "takodu.active_establishment_id",
  organizationId: "takodu.active_organization_id",
  previewOrganizationId: "takodu.preview_organization_id",
} as const;

export const workspaceSelectionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 180,
};
