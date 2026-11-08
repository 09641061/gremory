/** @vitest-environment jsdom */
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import type { WorkforcePermissionDefinition, WorkforceRole } from "@/contexts/workforce/application/model/workforce";
import { WorkforceRoleEditor } from "@/contexts/workforce/interfaces/components/workforce-role-editor";

vi.mock("@/contexts/workforce/interfaces/actions/workforce.actions", () => ({
  saveWorkforceRoleAction: vi.fn(),
}));

const permissions: readonly WorkforcePermissionDefinition[] = [
  {
    key: "scheduling:workspace:manage",
    group: "Operación diaria",
    label: "Agenda y citas",
    description: "Permite trabajar con citas y disponibilidad.",
    allowedScopes: ["SELF", "ESTABLISHMENT", "ORGANIZATION"],
    sensitive: false,
    dependencies: [
      "scheduling:appointments:read",
      "scheduling:appointments:create",
      "scheduling:appointments:cancel",
    ],
  },
  {
    key: "billing:invoices:access",
    group: "Administración",
    label: "Facturación",
    description: "Permite consultar y descargar comprobantes.",
    allowedScopes: ["ORGANIZATION"],
    sensitive: true,
    dependencies: ["billing:invoices:read", "billing:invoices:download"],
  },
];

describe("WorkforceRoleEditor", () => {
  it("should render one checkbox per business area instead of CRUD levels", () => {
    render(<WorkforceRoleEditor organizationId="organization-id" permissions={permissions} />);

    expect(screen.getByRole("checkbox", { name: "Agenda y citas" })).toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: "Facturación" })).toBeInTheDocument();
    expect(screen.queryByText("Crear citas")).not.toBeInTheDocument();
    expect(screen.queryByText("Cancelar citas")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Consulta" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Gestión" })).not.toBeInTheDocument();
  });

  it("should submit the selected area with the chosen scope", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <WorkforceRoleEditor organizationId="organization-id" permissions={permissions} />,
    );

    await user.click(screen.getByRole("checkbox", { name: "Agenda y citas" }));
    await user.click(screen.getByRole("button", { name: "Su sede" }));

    const grants = container.querySelector<HTMLInputElement>('input[name="selectedGrants"]');
    expect(JSON.parse(grants?.value ?? "[]")).toEqual([
      { permissionKey: "scheduling:workspace:manage", scope: "ESTABLISHMENT" },
    ]);
  });

  it("should show a fixed scope instead of a useless selector when only one is allowed", async () => {
    const user = userEvent.setup();
    render(<WorkforceRoleEditor organizationId="organization-id" permissions={permissions} />);

    await user.click(screen.getByRole("checkbox", { name: "Facturación" }));

    expect(screen.getByText("Toda la organización")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Toda la organización" })).not.toBeInTheDocument();
  });

  it("should preserve legacy grants until their related area is reviewed", () => {
    const role = legacyRole();
    const { container } = render(
      <WorkforceRoleEditor organizationId="organization-id" permissions={permissions} role={role} />,
    );

    expect(screen.getByText("Configuración anterior conservada")).toBeInTheDocument();
    const grants = container.querySelector<HTMLInputElement>('input[name="selectedGrants"]');
    expect(JSON.parse(grants?.value ?? "[]")).toContainEqual({
      permissionKey: "scheduling:appointments:cancel",
      scope: "SELF",
    });
  });

  it("should replace related legacy grants when the owner selects the business area", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <WorkforceRoleEditor organizationId="organization-id" permissions={permissions} role={legacyRole()} />,
    );

    await user.click(screen.getByRole("checkbox", { name: "Agenda y citas" }));

    const grants = container.querySelector<HTMLInputElement>('input[name="selectedGrants"]');
    expect(JSON.parse(grants?.value ?? "[]")).toEqual([
      { permissionKey: "scheduling:workspace:manage", scope: "SELF" },
    ]);
  });
});

function legacyRole(): WorkforceRole {
  return {
    id: "role-id",
    organizationId: "organization-id",
    name: "Especialista",
    description: null,
    status: "ACTIVE",
    version: 1,
    selectedGrants: [{ permissionKey: "scheduling:appointments:cancel", scope: "SELF" }],
    effectiveGrants: [
      { permissionKey: "scheduling:appointments:cancel", scope: "SELF" },
      { permissionKey: "scheduling:appointments:read", scope: "SELF" },
    ],
    activeMemberCount: 1,
    pendingInvitationCount: 0,
    updatedAt: "2026-11-07T12:00:00Z",
  };
}
