const DEFAULT_REFRESH_WINDOW_IN_SECONDS = 30;

export function shouldRefreshAccessToken(
  accessToken: string,
  nowInMilliseconds = Date.now(),
  refreshWindowInSeconds = DEFAULT_REFRESH_WINDOW_IN_SECONDS
): boolean {
  const expirationInSeconds = getTokenExpiration(accessToken);
  if (expirationInSeconds === null) return true;

  return expirationInSeconds <=
    Math.floor(nowInMilliseconds / 1000) + refreshWindowInSeconds;
}

function getTokenExpiration(accessToken: string): number | null {
  try {
    const payload = accessToken.split(".")[1];
    if (!payload) return null;

    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(
      base64.length + ((4 - (base64.length % 4)) % 4),
      "="
    );
    const parsed = JSON.parse(atob(padded)) as { exp?: unknown };
    return typeof parsed.exp === "number" ? parsed.exp : null;
  } catch {
    return null;
  }
}
