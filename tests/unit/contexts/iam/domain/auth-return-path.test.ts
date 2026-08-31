import {
  loginPath,
  normalizeAuthReturnPath,
} from "@/contexts/iam/domain/model/valueobjects/auth-return-path";

describe("Authentication return path", () => {
  it("should preserve a local invitation path when input is valid", () => {
    const path = normalizeAuthReturnPath(
      "/invitations/accept?token=raw-token",
    );

    expect(path).toBe("/invitations/accept?token=raw-token");
    expect(loginPath(path)).toBe(
      "/login?next=%2Finvitations%2Faccept%3Ftoken%3Draw-token",
    );
  });

  it.each([
    "https://evil.example/path",
    "//evil.example/path",
    "/\\evil.example/path",
    "",
  ])("should reject an unsafe return path when input is %s", (input) => {
    expect(normalizeAuthReturnPath(input)).toBeNull();
  });
});
