/** @vitest-environment jsdom */
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Building2 } from "lucide-react";
import { EntityProfileCard } from "@/contexts/business/interfaces/components/entity-profile-card/entity-profile-card";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

describe("EntityProfileCard", () => {
  const updateAction = vi.fn().mockResolvedValue({ status: "idle", data: null, error: null });

  it("renders without extraFields exactly as before (no extra content)", () => {
    render(
      <EntityProfileCard
        entityLabel="Organization"
        photoNoun="logo"
        icon={Building2}
        entityId="org-1"
        entityName="Acme"
        photoUrl={null}
        updateAction={updateAction}
      />,
    );

    expect(screen.getByText("Organization Name")).toBeDefined();
    expect(screen.queryByTestId("extra-fields")).toBeNull();
  });

  it("renders extraFields between the name field and the footer when provided", () => {
    render(
      <EntityProfileCard
        entityLabel="Establishment"
        photoNoun="photo"
        icon={Building2}
        entityId="est-1"
        entityName="Main Store"
        photoUrl={null}
        updateAction={updateAction}
        extraFields={<div data-testid="extra-fields">Time zone field</div>}
      />,
    );

    expect(screen.getByTestId("extra-fields")).toBeDefined();
    expect(screen.getByText("Time zone field")).toBeDefined();
  });

  it("disables extraFields' own controls via canUpdate, inherited by the caller", () => {
    render(
      <EntityProfileCard
        entityLabel="Establishment"
        photoNoun="photo"
        icon={Building2}
        entityId="est-1"
        entityName="Main Store"
        photoUrl={null}
        updateAction={updateAction}
        canUpdate={false}
        extraFields={
          <input data-testid="extra-input" disabled placeholder="Time zone" />
        }
      />,
    );

    const input = screen.getByTestId("extra-input") as HTMLInputElement;
    expect(input.disabled).toBe(true);
    expect(screen.queryByRole("button", { name: "Save" })).toBeNull();
  });
});
