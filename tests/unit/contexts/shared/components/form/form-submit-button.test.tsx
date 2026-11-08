/** @vitest-environment jsdom */
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";

import { FormSubmitButton } from "@/contexts/shared/interfaces/components/form/form-submit-button";

// ---------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------

describe("FormSubmitButton — rendering", () => {
  it("renders the label as the visible text", () => {
    render(<FormSubmitButton isSubmitting={false}>Save customer</FormSubmitButton>);
    expect(screen.getByRole("button", { name: "Save customer" })).toBeInTheDocument();
  });

  it("renders as type=submit so it triggers the surrounding form", () => {
    render(<FormSubmitButton isSubmitting={false}>Save</FormSubmitButton>);
    expect(screen.getByRole("button", { name: "Save" })).toHaveAttribute("type", "submit");
  });
});

// ---------------------------------------------------------------------------
// Loading state
// ---------------------------------------------------------------------------

describe("FormSubmitButton — loading state", () => {
  it("shows a spinner (svg.animate-spin) when isSubmitting is true", () => {
    render(<FormSubmitButton isSubmitting>Save customer</FormSubmitButton>);
    const button = screen.getByRole("button", { name: /save customer/i });
    expect(button.querySelector("svg.animate-spin")).toBeInTheDocument();
  });

  it("disables the button while isSubmitting is true", () => {
    render(<FormSubmitButton isSubmitting>Save</FormSubmitButton>);
    expect(screen.getByRole("button", { name: /save/i })).toBeDisabled();
  });

  it("sets aria-busy=true while submitting for screen readers", () => {
    render(<FormSubmitButton isSubmitting>Saving</FormSubmitButton>);
    expect(screen.getByRole("button", { name: /saving/i })).toHaveAttribute(
      "aria-busy",
      "true",
    );
  });

  it("hides the leading icon while submitting (spinner takes its place)", () => {
    render(
      <FormSubmitButton isSubmitting icon={<span data-testid="custom-icon" />}>
        Save
      </FormSubmitButton>,
    );
    expect(screen.queryByTestId("custom-icon")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /save/i }).querySelector("svg.animate-spin"))
      .toBeInTheDocument();
  });

  it("keeps the label visible while submitting", () => {
    render(<FormSubmitButton isSubmitting>Saving...</FormSubmitButton>);
    expect(screen.getByRole("button", { name: /saving/i })).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Idle state
// ---------------------------------------------------------------------------

describe("FormSubmitButton — idle state", () => {
  it("renders the leading icon when provided and isSubmitting is false", () => {
    render(
      <FormSubmitButton isSubmitting={false} icon={<span data-testid="custom-icon" />}>
        Save
      </FormSubmitButton>,
    );
    expect(screen.getByTestId("custom-icon")).toBeInTheDocument();
    // No spinner when idle.
    expect(
      screen.getByRole("button", { name: /save/i }).querySelector("svg.animate-spin"),
    ).not.toBeInTheDocument();
  });

  it("does not render a spinner when isSubmitting is false", () => {
    render(<FormSubmitButton isSubmitting={false}>Save</FormSubmitButton>);
    expect(
      screen.getByRole("button", { name: /save/i }).querySelector("svg.animate-spin"),
    ).not.toBeInTheDocument();
  });

  it("is enabled by default", () => {
    render(<FormSubmitButton isSubmitting={false}>Save</FormSubmitButton>);
    expect(screen.getByRole("button", { name: /save/i })).toBeEnabled();
  });

  it("sets aria-busy=false when idle", () => {
    render(<FormSubmitButton isSubmitting={false}>Save</FormSubmitButton>);
    expect(screen.getByRole("button", { name: /save/i })).toHaveAttribute(
      "aria-busy",
      "false",
    );
  });
});

// ---------------------------------------------------------------------------
// Disabled + variant forwarding
// ---------------------------------------------------------------------------

describe("FormSubmitButton — disabled + variant forwarding", () => {
  it("respects an explicit disabled prop in addition to isSubmitting", () => {
    render(
      <FormSubmitButton isSubmitting={false} disabled>
        Save
      </FormSubmitButton>,
    );
    expect(screen.getByRole("button", { name: /save/i })).toBeDisabled();
  });

  it("still disables when both isSubmitting is true AND disabled is set", () => {
    render(
      <FormSubmitButton isSubmitting disabled>
        Save
      </FormSubmitButton>,
    );
    const button = screen.getByRole("button", { name: /save/i });
    expect(button).toBeDisabled();
    expect(button.querySelector("svg.animate-spin")).toBeInTheDocument();
  });
});
