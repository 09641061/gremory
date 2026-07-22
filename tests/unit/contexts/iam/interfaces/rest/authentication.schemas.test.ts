import { authenticationSessionSchema, confirmEmailSignInSchema, requestEmailSignInSchema } from "@/contexts/iam/interfaces/rest/schemas/authentication.schemas";

describe("IAM authentication schemas", () => {
  it("should trim a valid email when requesting sign-in", () => {
    expect(requestEmailSignInSchema.parse({ email: " user@example.com " })).toEqual({ email: "user@example.com" });
  });

  it("should reject a verification code that is not six digits", () => {
    expect(confirmEmailSignInSchema.safeParse({ email: "user@example.com", code: "12a" }).success).toBe(false);
  });

  it("should reject a session with a non-positive expiry", () => {
    expect(authenticationSessionSchema.safeParse({ accessToken: "a", refreshToken: "r", expiresIn: 0 }).success).toBe(false);
  });
});
