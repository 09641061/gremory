/** Cookie names are shared as inert data; only server actions may write them. */
export const workspaceSelectionCookies = {
  establishmentId: "takodu.active_establishment_id",
  organizationId: "takodu.active_organization_id",
  previewOrganizationId: "takodu.preview_organization_id",
} as const;
