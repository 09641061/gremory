/**
 * Application-owned workspace selection input.
 *
 * The selection describes which organization/establishment the caller wants
 * the workspace snapshot to be scoped to. It is consumer-owned so the
 * Application port can express the contract without leaning on the
 * Infrastructure gateway types.
 */
export type BusinessWorkspaceSelection = Readonly<{
  organizationId?: string;
  establishmentId?: string;
}>;

export type BusinessWorkspaceQuery = BusinessWorkspaceSelection;
