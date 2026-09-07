export type WorkspaceSelectionQuery = Readonly<{
  organizationId?: string;
  establishmentId?: string;
}>;

/** Preserve an explicit workspace selection when the entry policy changes path. */
export function appendWorkspaceSelection(
  path: string,
  query: WorkspaceSelectionQuery,
): string {
  const params = new URLSearchParams();
  if (query.organizationId) params.set("organizationId", query.organizationId);
  if (query.establishmentId) params.set("establishmentId", query.establishmentId);
  const queryString = params.toString();
  return queryString ? `${path}?${queryString}` : path;
}
