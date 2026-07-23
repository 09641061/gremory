import { describe, it, expect } from "vitest";
import { IamJwtQueryService } from "@/contexts/iam/application/internal/queryservices/iam-jwt-query.service";

describe("IamJwtQueryService", () => {
  const service = new IamJwtQueryService();

  function buildToken(payload: object): string {
    const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64");
    const body = Buffer.from(JSON.stringify(payload)).toString("base64");
    return `${header}.${body}.signature`;
  }

  it("extracts user ID (sub) and claims from a valid JWT token payload", () => {
    const payload = {
      sub: "50430213-5302-487e-ac52-5a233c1d217c",
      email: "takoduindustries@gmail.com",
      sid: "RLJUF8MKyyi_PD1JY0WeG_pLvQQjUggSuoZeeZcKIGY",
      iat: 1784766883,
      exp: 1784767483,
    };
    const token = buildToken(payload);

    const claims = service.decodeToken(token);
    expect(claims).not.toBeNull();
    expect(claims?.sub).toBe("50430213-5302-487e-ac52-5a233c1d217c");
    expect(claims?.email).toBe("takoduindustries@gmail.com");
    expect(claims?.sid).toBe("RLJUF8MKyyi_PD1JY0WeG_pLvQQjUggSuoZeeZcKIGY");

    const userId = service.extractUserId(token);
    expect(userId).toBe("50430213-5302-487e-ac52-5a233c1d217c");
  });

  it("returns null for malformed or missing token", () => {
    expect(service.decodeToken("invalid-token")).toBeNull();
    expect(service.extractUserId("invalid-token")).toBeNull();
    expect(service.decodeToken("")).toBeNull();
  });

  it("returns null for extractUserId if sub claim is missing in JWT payload", () => {
    const token = buildToken({ email: "test@example.com" });
    expect(service.extractUserId(token)).toBeNull();
    expect(service.decodeToken(token)?.email).toBe("test@example.com");
  });

});
