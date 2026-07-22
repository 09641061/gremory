import "server-only";

export const iamSessionCookies = {
  accessToken: "takodu.access_token",
  refreshToken: "takodu.refresh_token",
  expiresIn: "takodu.expires_in",
  pendingEmail: "takodu.pending_email",
} as const;

export const iamSessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};
