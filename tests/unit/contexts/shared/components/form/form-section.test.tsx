/** @vitest-environment jsdom */
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";

import { FormSection } from "@/contexts/shared/interfaces/components/form/form-section";
import { Input } from "@/contexts/shared/interfaces/components/ui/input";
import { Label } from "@/contexts/shared/interfaces/components/ui/label";

// ---------------------------------------------------------------------------
// Header rendering
// ---------------------------------------------------------------------------

describe("FormSection — header rendering", () => {
  it("renders the title in an <h2>", () => {
    render(
      <FormSection title="Identity">
        <div />
      </FormSection>,
    );
    const title = screen.getByRole("heading", { name: "Identity" });
    expect(title.tagName).toBe("H2");
  });

  it("renders the description as a paragraph", () => {
    render(
      <FormSection title="Identity" description="How we identify the customer">
        <div />
      </FormSection>,
    );
    const description = screen.getByText("How we identify the customer");
    expect(description.tagName).toBe("P");
  });

  it("renders only the title when no description is provided", () => {
    render(
      <FormSection title="Identity">
        <div />
      </FormSection>,
    );
    expect(screen.getByRole("heading", { name: "Identity" })).toBeInTheDocument();
    // The header element exists but contains only the title, no <p>.
    const header = document.querySelector("header");
    expect(header).not.toBeNull();
    expect(header?.querySelector("p")).toBeNull();
  });

  it("renders only the description when no title is provided", () => {
    render(
      <FormSection description="Optional supporting copy">
        <div />
      </FormSection>,
    );
    expect(screen.getByText("Optional supporting copy")).toBeInTheDocument();
    expect(screen.queryByRole("heading")).not.toBeInTheDocument();
  });

  it("omits the header element entirely when neither title nor description is provided", () => {
    const { container } = render(
      <FormSection>
        <div data-testid="child" />
      </FormSection>,
    );
    expect(container.querySelector("header")).toBeNull();
    expect(screen.getByTestId("child")).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Children rendering
// ---------------------------------------------------------------------------

describe("FormSection — children", () => {
  it("renders every child in document order", () => {
    render(
      <FormSection title="Fields">
        <Label htmlFor="a">A</Label>
        <Input id="a" aria-label="A" />
        <Label htmlFor="b">B</Label>
        <Input id="b" aria-label="B" />
      </FormSection>,
    );
    expect(screen.getByLabelText("A")).toBeInTheDocument();
    expect(screen.getByLabelText("B")).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Spacing
// ---------------------------------------------------------------------------

describe("FormSection — spacing", () => {
  it("applies 24px top padding and a 1px top border to separate sections", () => {
    const { container } = render(
      <FormSection title="Identity">
        <div />
      </FormSection>,
    );
    const section = container.querySelector("section") as HTMLElement;
    expect(section).not.toBeNull();
    expect(section.className).toMatch(/pt-6/);
    expect(section.className).toMatch(/border-t/);
  });

  it("applies a 16px gap between fields inside the body", () => {
    const { container } = render(
      <FormSection title="Identity">
        <div />
        <div />
      </FormSection>,
    );
    // The body wrapper carries the inter-field gap.
    const body = container.querySelector("section > div") as HTMLElement;
    expect(body).not.toBeNull();
    expect(body.className).toMatch(/space-y-4/);
  });

  it("honours a custom className on the root <section>", () => {
    const { container } = render(
      <FormSection title="Identity" className="custom-class">
        <div />
      </FormSection>,
    );
    const section = container.querySelector("section") as HTMLElement;
    expect(section.className).toMatch(/custom-class/);
    // Spacing tokens must still apply even when a custom class is added.
    expect(section.className).toMatch(/pt-6/);
  });
});
