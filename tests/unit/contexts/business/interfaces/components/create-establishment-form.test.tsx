/** @vitest-environment jsdom */

import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/contexts/business/interfaces/actions/establishment.actions", () => ({
  createEstablishmentAction: vi.fn(),
}));

import { CreateEstablishmentForm } from "@/contexts/business/interfaces/components/establishment/create-establishment/create-establishment-form";

describe("CreateEstablishmentForm", () => {
  it("detects system timezone or defaults to America/Lima", () => {
    const { container } = render(
      <CreateEstablishmentForm organizationId="11111111-1111-4111-8111-111111111111" />
    );

    const timeZoneInput = container.querySelector<HTMLInputElement>('input[name="timeZone"]');
    expect(timeZoneInput).not.toBeNull();

    const expectedTimeZone = (() => {
      try {
        return Intl.DateTimeFormat().resolvedOptions().timeZone || "America/Lima";
      } catch {
        return "America/Lima";
      }
    })();

    expect(timeZoneInput?.value).toBe(expectedTimeZone);
  });
});
