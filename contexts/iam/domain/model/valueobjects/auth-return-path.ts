/**
 * Normalizes a browser-provided return path without importing a Web API
 * constructor into Domain. The policy only accepts an absolute-path reference
 * on the local origin; protocol-relative, absolute, escaped, and control
 * character inputs are rejected.
 */
export function normalizeAuthReturnPath(value: unknown): string | null {
  if (typeof value !== "string") return null;

  const candidate = value.trim();
  if (
    !candidate.startsWith("/") ||
    candidate.startsWith("//") ||
    candidate.includes("\\") ||
    /[\u0000-\u001f\u007f]/.test(candidate)
  ) {
    return null;
  }

  // `candidate` is already constrained to a path reference. Keeping the
  // string intact preserves encoded query/hash values exactly as submitted;
  // no URL/DOM API is needed for this local policy.
  if (candidate.includes("://") || candidate.toLowerCase().startsWith("/javascript:")) {
    return null;
  }

  return candidate;
}

export function loginPath(returnTo: string | null): string {
  return returnTo ? `/login?next=${encodeURIComponent(returnTo)}` : "/login";
}
