import type { AuthenticationSession } from "../../domain/model/entities/authentication-session";

export type ResolvedSession =
  | Readonly<{
      status: "authenticated";
      accessToken: string;
      rotatedSession: AuthenticationSession | null;
    }>
  | Readonly<{ status: "unauthenticated" }>
  | Readonly<{ status: "unavailable" }>;

export type AccessTokenVerification =
  | "authenticated"
  | "unauthenticated"
  | "unavailable";
