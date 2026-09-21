/**
 * Cookie options belong to Infrastructure. Cookie names are re-exported from
 * the application model so client components can pass opaque selection data
 * to a server action without importing a server-only module.
 */
export { workspaceSelectionCookies } from "../../application/model/workspace-selection-cookies";

export const workspaceSelectionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 180,
};
