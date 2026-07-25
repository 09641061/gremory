import "server-only";

export const iamSessionCookies = {
  accessToken: "takodu.access_token",
  refreshToken: "takodu.refresh_token",
  pendingEmail: "takodu.pending_email",
} as const;

export const iamSessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

export const iamSessionCookieMaxAge = {
  accessToken: 60 * 60 * 24,
  refreshToken: 60 * 60 * 24 * 30,
} as const;
