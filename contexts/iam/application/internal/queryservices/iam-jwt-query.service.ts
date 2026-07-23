export interface IamAccessTokenClaims {
  sub?: string;
  email?: string;
  sid?: string;
  iat?: number;
  exp?: number;
}

export class IamJwtQueryService {
  /**
   * Decodes an IAM access token and returns its claims payload.
   */
  public decodeToken(token: string): IamAccessTokenClaims | null {
    if (!token || typeof token !== "string") return null;

    try {
      const parts = token.split(".");
      if (parts.length < 2 || !parts[1]) return null;

      const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
      const padded = base64.padEnd(
        base64.length + ((4 - (base64.length % 4)) % 4),
        "="
      );

      const jsonString =
        typeof window !== "undefined" && typeof atob === "function"
          ? atob(padded)
          : Buffer.from(padded, "base64").toString("utf-8");

      const payload = JSON.parse(jsonString) as Partial<IamAccessTokenClaims>;
      if (!payload || typeof payload !== "object") {
        return null;
      }

      return {
        sub: typeof payload.sub === "string" ? payload.sub : undefined,
        email: typeof payload.email === "string" ? payload.email : undefined,
        sid: typeof payload.sid === "string" ? payload.sid : undefined,
        iat: typeof payload.iat === "number" ? payload.iat : undefined,
        exp: typeof payload.exp === "number" ? payload.exp : undefined,
      };
    } catch {
      return null;
    }
  }

  /**
   * Extracts the user ID (sub claim) from an IAM access token.
   */
  public extractUserId(token: string): string | null {
    const claims = this.decodeToken(token);
    return claims?.sub ?? null;
  }
}

