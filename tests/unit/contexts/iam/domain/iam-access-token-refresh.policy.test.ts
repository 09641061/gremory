import { shouldRefreshAccessToken } from "@/contexts/iam/domain/services/iam-access-token-refresh.policy";

function tokenWithExpiration(expirationInSeconds: number): string {
  const payload = Buffer.from(JSON.stringify({ exp: expirationInSeconds })).toString("base64url");
  return `header.${payload}.signature`;
}

describe("IAM access token refresh policy", () => {
  it("should refresh the access token when it expires inside the refresh window", () => {
    // Arrange
    const nowInMilliseconds = 1_700_000_000_000;
    const token = tokenWithExpiration(1_700_000_020);

    // Act
    const result = shouldRefreshAccessToken(token, nowInMilliseconds);

    // Assert
    expect(result).toBe(true);
  });

  it("should keep the access token when it remains valid beyond the refresh window", () => {
    // Arrange
    const nowInMilliseconds = 1_700_000_000_000;
    const token = tokenWithExpiration(1_700_000_120);

    // Act
    const result = shouldRefreshAccessToken(token, nowInMilliseconds);

    // Assert
    expect(result).toBe(false);
  });

  it("should refresh the session when the access token cannot be parsed", () => {
    // Arrange
    const malformedToken = "not-a-jwt";

    // Act
    const result = shouldRefreshAccessToken(malformedToken);

    // Assert
    expect(result).toBe(true);
  });
});
