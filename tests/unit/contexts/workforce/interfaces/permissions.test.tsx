/** @vitest-environment jsdom */

import { render, screen } from "@testing-library/react";

import type { AuthorizationResource } from "@/contexts/workforce/application/model/user-session";
import { WorkspaceAuthProvider } from "@/contexts/workforce/interfaces/context/WorkspaceAuthContext";
import { InviteMemberButton } from "@/contexts/workforce/interfaces/components/invite-member-button";
import { usePermissions } from "@/contexts/workforce/interfaces/hooks/usePermissions";

const authorization: AuthorizationResource = {
  accountType: "MEMBER",
  scope: {
    type: "ESTABLISHMENT",
    organizationId: "11111111-1111-4111-8111-111111111111",
    establishmentId: "22222222-2222-4222-8222-222222222222",
  },
  roles: [
    {
      id: "33333333-3333-4333-8333-333333333333",
      name: "Supervisor",
      systemRole: false,
      position: 2,
      permissions: ["workforce:invite"],
    },
    {
      id: "44444444-4444-4444-8444-444444444444",
      name: "Everyone",
      systemRole: true,
      position: 2147483647,
      permissions: ["organization:read"],
    },
  ],
  effectivePermissions: ["workforce:invite"],
};

function PermissionProbe() {
  const { hasPermission, isSystemRole } = usePermissions();

  return (
    <output>
      {JSON.stringify({
        invite: hasPermission("workforce:invite"),
        remove: hasPermission("workforce:remove_members"),
        everyone: isSystemRole("Everyone"),
        supervisor: isSystemRole("Supervisor"),
      })}
    </output>
  );
}

describe("workforce permission engine", () => {
  it("matches exact permissions and protected system roles", () => {
    render(
      <WorkspaceAuthProvider authorization={authorization}>
        <PermissionProbe />
      </WorkspaceAuthProvider>,
    );

    expect(screen.getByRole("status")).toHaveTextContent(
      JSON.stringify({ invite: true, remove: false, everyone: true, supervisor: false }),
    );
  });

  it("allows every permission when the workspace contains the wildcard", () => {
    render(
      <WorkspaceAuthProvider authorization={{ ...authorization, effectivePermissions: ["*"] }}>
        <PermissionProbe />
      </WorkspaceAuthProvider>,
    );

    expect(screen.getByRole("status")).toHaveTextContent(
      JSON.stringify({ invite: true, remove: true, everyone: true, supervisor: false }),
    );
  });

  it("does not render the invite action without workforce:invite", () => {
    render(
      <WorkspaceAuthProvider authorization={{ ...authorization, effectivePermissions: [] }}>
        <InviteMemberButton onClick={() => {}} />
      </WorkspaceAuthProvider>,
    );

    expect(screen.queryByRole("button", { name: "Invite member" })).toBeNull();
  });

  it("renders the invite action with the consolidated permission", () => {
    render(
      <WorkspaceAuthProvider authorization={authorization}>
        <InviteMemberButton onClick={() => {}} />
      </WorkspaceAuthProvider>,
    );

    expect(screen.getByRole("button", { name: "Invite member" })).toBeVisible();
  });
});
