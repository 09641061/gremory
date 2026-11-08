"use server";

import { cookies } from "next/headers";
import { workspaceSelectionCookies } from "../../application/model/workspace-selection-cookies";
import { workspaceSelectionCookieOptions } from "../../infrastructure/session/workspace-selection-cookie";

/** Persist workspace navigation in the request's server cookie store. */
export async function setWorkspaceSelectionAction(input: {
  organizationId: string;
  establishmentId?: string | null;
  previewOrganizationId?: string | null;
}): Promise<void> {
  const store = await cookies();
  store.set(workspaceSelectionCookies.organizationId, input.organizationId, workspaceSelectionCookieOptions);
  if (input.previewOrganizationId) {
    store.set(workspaceSelectionCookies.previewOrganizationId, input.previewOrganizationId, workspaceSelectionCookieOptions);
  } else {
    store.delete(workspaceSelectionCookies.previewOrganizationId);
  }
  if (input.establishmentId) {
    store.set(workspaceSelectionCookies.establishmentId, input.establishmentId, workspaceSelectionCookieOptions);
  } else {
    store.delete(workspaceSelectionCookies.establishmentId);
  }
}
