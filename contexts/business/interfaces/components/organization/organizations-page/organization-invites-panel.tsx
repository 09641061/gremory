"use client";

import {
  OrganizationMembersPanel,
  type OrganizationRosterPanelProps,
} from "./organization-members-panel";

/**
 * Pending-invitations view. Shares the roster engine with the Members panel but pins the
 * status to PENDING, so invitations are isolated from active personnel.
 */
export function OrganizationInvitesPanel(props: Omit<OrganizationRosterPanelProps, "mode">) {
  return <OrganizationMembersPanel mode="invites" {...props} />;
}
