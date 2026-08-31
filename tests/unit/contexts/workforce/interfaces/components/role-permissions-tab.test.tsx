/** @vitest-environment jsdom */
import { useState } from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { RolePermissionsTab } from "@/contexts/workforce/interfaces/components/permissions/role-permissions-tab";

vi.mock("next/link", () => ({
  default: ({ href, ...props }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...props} />
  ),
}));

function getSwitchRow(permissionCode: string) {
  const row = screen.getByText(permissionCode).closest("label");
  if (!row) throw new Error(`Missing permission row for ${permissionCode}`);
  return row;
}

function getRowSwitch(permissionCode: string) {
  return within(getSwitchRow(permissionCode)).getByRole("switch");
}

function renderTab(overrides: { assistantLocked?: boolean; canUpgradeAssistant?: boolean } = {}) {
  function Harness() {
    const [selected, setSelected] = useState<ReadonlySet<string>>(new Set());
    const [filter, setFilter] = useState("");

    return (
      <RolePermissionsTab
        permissions={["assistant:manage", "scheduling:read"]}
        editable
        selectedPermissions={selected}
        setSelectedPermissions={setSelected}
        permissionFilter={filter}
        setPermissionFilter={setFilter}
        assistantLocked={overrides.assistantLocked}
        canUpgradeAssistant={overrides.canUpgradeAssistant}
      />
    );
  }

  render(<Harness />);
}

describe("RolePermissionsTab assistant permission gating", () => {
  it("locks the assistant permission on the Free plan", () => {
    renderTab({ assistantLocked: true, canUpgradeAssistant: true });

    expect(screen.getByText("Disponible en Plan Pro")).toBeInTheDocument();
    expect(getRowSwitch("assistant:manage")).toHaveAttribute("aria-disabled", "true");
    expect(getRowSwitch("scheduling:read")).not.toHaveAttribute("aria-disabled");
  });

  it("opens the upgrade dialog with the owner-only upgrade button", async () => {
    const user = userEvent.setup();
    renderTab({ assistantLocked: true, canUpgradeAssistant: true });

    await user.click(screen.getByText("Disponible en Plan Pro"));

    expect(screen.getByText("El asistente IA solo está disponible en el Plan Pro.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Actualizar plan" })).toHaveAttribute("href", "/upgrade");
    expect(screen.queryByRole("button", { name: "Más información" })).not.toBeInTheDocument();
  });

  it("shows the info button for invited members who cannot manage billing", async () => {
    const user = userEvent.setup();
    renderTab({ assistantLocked: true, canUpgradeAssistant: false });

    await user.click(screen.getByText("Disponible en Plan Pro"));

    expect(screen.getByText("El asistente IA solo está disponible en el Plan Pro.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Más información" })).toHaveAttribute("href", "/upgrade");
    expect(screen.queryByRole("button", { name: "Actualizar plan" })).not.toBeInTheDocument();
  });

  it("does not gate the assistant permission on paid plans", () => {
    renderTab({ assistantLocked: false });

    expect(screen.queryByText("Disponible en Plan Pro")).not.toBeInTheDocument();
    expect(getRowSwitch("assistant:manage")).not.toHaveAttribute("aria-disabled");
  });
});
