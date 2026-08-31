const localOrigin = "http://takodu.local";

export function normalizeAuthReturnPath(value: unknown): string | null {
  if (typeof value !== "string") return null;

  const candidate = value.trim();
  if (!candidate.startsWith("/") || candidate.startsWith("//") || candidate.includes("\\")) {
    return null;
  }

  try {
    const url = new URL(candidate, localOrigin);
    if (url.origin !== localOrigin) return null;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return null;
  }
}

export function loginPath(returnTo: string | null): string {
  return returnTo ? `/login?next=${encodeURIComponent(returnTo)}` : "/login";
}
