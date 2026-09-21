/** @vitest-environment jsdom */
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Loader2, ExternalLink } from "lucide-react";

import { FormField } from "@/contexts/shared/interfaces/components/form/form-field";
import { Button } from "@/contexts/shared/interfaces/components/ui/button";
import { Input } from "@/contexts/shared/interfaces/components/ui/input";

// ---------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------

describe("FormField — rendering", () => {
  it("renders the label with htmlFor pointing at the input id", () => {
    render(
      <FormField id="email" label="Email address">
        <Input id="email" />
      </FormField>,
    );

    const label = screen.getByText("Email address");
    expect(label.tagName).toBe("LABEL");
    expect(label).toHaveAttribute("for", "email");
  });

  it("renders the supplied child input", () => {
    render(
      <FormField id="email" label="Email">
        <Input id="email" aria-label="Email" />
      </FormField>,
    );
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
  });

  it("renders an asterisk on the label when required is true", () => {
    render(
      <FormField id="email" label="Email" required>
        <Input id="email" />
      </FormField>,
    );
    const label = screen.getByText("Email");
    expect(label.querySelector('[aria-hidden="true"]')).toHaveTextContent("*");
  });

  it("does NOT render an asterisk on the label when required is false", () => {
    render(
      <FormField id="email" label="Email">
        <Input id="email" />
      </FormField>,
    );
    expect(screen.queryByText("*")).not.toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Error state
// ---------------------------------------------------------------------------

describe("FormField — error state", () => {
  it("shows the error message with role=alert", () => {
    render(
      <FormField id="dni" label="DNI" error="DNI must be 8 digits">
        <Input id="dni" />
      </FormField>,
    );

    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("DNI must be 8 digits");
  });

  it("applies aria-invalid=true to the child input when error is set", () => {
    render(
      <FormField id="dni" label="DNI" error="invalid">
        <Input id="dni" aria-label="DNI" />
      </FormField>,
    );
    expect(screen.getByLabelText("DNI")).toHaveAttribute(
      "aria-invalid",
      "true",
    );
  });

  it("does NOT apply aria-invalid when there is no error", () => {
    render(
      <FormField id="dni" label="DNI">
        <Input id="dni" aria-label="DNI" />
      </FormField>,
    );
    const input = screen.getByLabelText("DNI");
    expect(input).not.toHaveAttribute("aria-invalid");
  });

  it("renders nothing for an error alert when error is undefined", () => {
    render(
      <FormField id="dni" label="DNI">
        <Input id="dni" />
      </FormField>,
    );
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("renders nothing for an error alert when error is an empty string", () => {
    render(
      <FormField id="dni" label="DNI" error="">
        <Input id="dni" />
      </FormField>,
    );
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("forwards aria-describedby pointing at the error id", () => {
    render(
      <FormField id="dni" label="DNI" error="invalid">
        <Input id="dni" aria-label="DNI" />
      </FormField>,
    );
    const input = screen.getByLabelText("DNI");
    const describedBy = input.getAttribute("aria-describedby");
    expect(describedBy).toBeTruthy();
    expect(describedBy).toContain("dni-error");
  });

  it("suppresses the hint when an error is present", () => {
    render(
      <FormField
        id="dni"
        label="DNI"
        error="invalid"
        hint="Enter your 8-digit DNI"
      >
        <Input id="dni" />
      </FormField>,
    );
    expect(
      screen.queryByText("Enter your 8-digit DNI"),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Hint state
// ---------------------------------------------------------------------------

describe("FormField — hint state", () => {
  it("shows the hint below the input when no error is set", () => {
    render(
      <FormField id="email" label="Email" hint="We never share your email">
        <Input id="email" />
      </FormField>,
    );
    const hint = screen.getByText("We never share your email");
    expect(hint).toBeInTheDocument();
    expect(hint.tagName).toBe("P");
  });

  it("forwards aria-describedby pointing at the hint id when no error", () => {
    render(
      <FormField id="email" label="Email" hint="We never share">
        <Input id="email" aria-label="Email" />
      </FormField>,
    );
    const input = screen.getByLabelText("Email");
    const describedBy = input.getAttribute("aria-describedby");
    expect(describedBy).toBeTruthy();
    expect(describedBy).toContain("email-hint");
  });

  it("renders nothing for the hint when hint is undefined", () => {
    render(
      <FormField id="email" label="Email">
        <Input id="email" />
      </FormField>,
    );
    expect(document.querySelector('p[id$="-hint"]')).toBeNull();
  });

  it("does NOT forward aria-describedby when there is no hint and no error", () => {
    render(
      <FormField id="email" label="Email">
        <Input id="email" aria-label="Email" />
      </FormField>,
    );
    const input = screen.getByLabelText("Email");
    expect(input).not.toHaveAttribute("aria-describedby");
  });
});

// ---------------------------------------------------------------------------
// Spacing / layout consistency
// ---------------------------------------------------------------------------

describe("FormField — spacing", () => {
  it("applies consistent vertical spacing to the wrapper", () => {
    const { container } = render(
      <FormField id="email" label="Email">
        <Input id="email" />
      </FormField>,
    );
    // The wrapper is the first child of the rendered tree; it must own the
    // 1.5 (6px) spacing rhythm that matches the rest of the form layer.
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toMatch(/space-y-1\.5/);
  });

  it("honours a custom className on the wrapper", () => {
    const { container } = render(
      <FormField id="email" label="Email" className="md:col-span-2">
        <Input id="email" />
      </FormField>,
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toMatch(/md:col-span-2/);
    // The base spacing token must still be present so layouts don't drift.
    expect(wrapper.className).toMatch(/space-y-1\.5/);
  });
});

// ---------------------------------------------------------------------------
// Trailing adornment
// ---------------------------------------------------------------------------

describe("FormField — trailing adornment", () => {
  it("renders the adornment when provided", () => {
    render(
      <FormField
        id="dni"
        label="DNI"
        trailingAdornment={<Button type="button">Autofill</Button>}
      >
        <Input id="dni" aria-label="DNI" />
      </FormField>,
    );
    expect(
      screen.getByRole("button", { name: /autofill/i }),
    ).toBeInTheDocument();
  });

  it("does NOT render any wrapper flex container when trailingAdornment is absent", () => {
    // The DOM tree must match the pre-adornment contract: label → input →
    // (optional hint/error). No extra <div> between label and input.
    const { container } = render(
      <FormField id="dni" label="DNI">
        <Input id="dni" />
      </FormField>,
    );
    const wrapper = container.firstChild as HTMLElement;
    // Direct children of the wrapper: <label>, <input>, nothing else.
    expect(wrapper.children.length).toBe(2);
    expect(wrapper.querySelector(":scope > div")).toBeNull();
  });

  it("wraps the input and the adornment in a flex container when adornment is present", () => {
    const { container } = render(
      <FormField
        id="dni"
        label="DNI"
        trailingAdornment={<Button type="button">Autofill</Button>}
      >
        <Input id="dni" />
      </FormField>,
    );
    // The wrapper now contains: <label>, <div> (flex), (optional hint/error).
    const wrapper = container.firstChild as HTMLElement;
    const flexContainer = wrapper.querySelector(
      ":scope > div",
    ) as HTMLElement | null;
    expect(flexContainer).not.toBeNull();
    expect(flexContainer!.className).toMatch(/flex/);
    // The container must hold the input AND the adornment as siblings.
    expect(flexContainer!.children.length).toBe(2);
    expect(flexContainer!.querySelector("input")).not.toBeNull();
    expect(flexContainer!.querySelector("button")).not.toBeNull();
  });

  it("applies flex-1 to the input so it expands to fill the row", () => {
    render(
      <FormField
        id="dni"
        label="DNI"
        trailingAdornment={<Button type="button">Autofill</Button>}
      >
        <Input id="dni" aria-label="DNI" />
      </FormField>,
    );
    const input = screen.getByLabelText("DNI");
    expect(input.className).toMatch(/\bflex-1\b/);
  });

  it("does NOT apply flex-1 to the adornment (adornment keeps natural size)", () => {
    render(
      <FormField
        id="dni"
        label="DNI"
        trailingAdornment={<Button type="button">Autofill</Button>}
      >
        <Input id="dni" aria-label="DNI" />
      </FormField>,
    );
    const button = screen.getByRole("button", { name: /autofill/i });
    expect(button.className).not.toMatch(/\bflex-1\b/);
  });

  it("uses gap-2 between the input and the adornment", () => {
    const { container } = render(
      <FormField
        id="dni"
        label="DNI"
        trailingAdornment={<Button type="button">Autofill</Button>}
      >
        <Input id="dni" />
      </FormField>,
    );
    const wrapper = container.firstChild as HTMLElement;
    const flexContainer = wrapper.querySelector(":scope > div") as HTMLElement;
    expect(flexContainer.className).toMatch(/\bgap-2\b/);
  });

  it("preserves the consumer-supplied className on the input alongside flex-1", () => {
    // The Input primitive's `w-full` and the consumer's `bg-card` must not be
    // wiped when we add `flex-1`. cn() (with twMerge) handles this; this test
    // pins the contract.
    render(
      <FormField
        id="dni"
        label="DNI"
        trailingAdornment={<Button type="button">Autofill</Button>}
      >
        <Input id="dni" aria-label="DNI" className="bg-card border-border" />
      </FormField>,
    );
    const input = screen.getByLabelText("DNI");
    expect(input.className).toMatch(/\bflex-1\b/);
    expect(input.className).toMatch(/bg-card/);
    expect(input.className).toMatch(/border-border/);
  });

  it("forwards aria-invalid to the input even when an adornment is present", () => {
    render(
      <FormField
        id="dni"
        label="DNI"
        error="invalid"
        trailingAdornment={<Button type="button">Autofill</Button>}
      >
        <Input id="dni" aria-label="DNI" />
      </FormField>,
    );
    const input = screen.getByLabelText("DNI");
    expect(input).toHaveAttribute("aria-invalid", "true");
    const describedBy = input.getAttribute("aria-describedby");
    expect(describedBy).toBeTruthy();
    expect(describedBy).toContain("dni-error");
  });

  it("does NOT set aria-invalid on the adornment wrapper (a11y lives on the input)", () => {
    // The wrapper div is purely structural; the aria-invalid attribute must
    // be on the <input>, never on the <div> that hosts it. This guards
    // against accidentally cloning the attribute onto the flex container.
    const { container } = render(
      <FormField
        id="dni"
        label="DNI"
        error="invalid"
        trailingAdornment={<Button type="button">Autofill</Button>}
      >
        <Input id="dni" />
      </FormField>,
    );
    const flexContainer = container.querySelector(
      ":scope > div > div",
    ) as HTMLElement;
    expect(flexContainer).not.toBeNull();
    expect(flexContainer.hasAttribute("aria-invalid")).toBe(false);
    expect(flexContainer.hasAttribute("aria-describedby")).toBe(false);
  });

  it("forwards aria-describedby pointing at the hint when no error is present", () => {
    render(
      <FormField
        id="dni"
        label="DNI"
        hint="We never share your DNI"
        trailingAdornment={<Button type="button">Autofill</Button>}
      >
        <Input id="dni" aria-label="DNI" />
      </FormField>,
    );
    const input = screen.getByLabelText("DNI");
    const describedBy = input.getAttribute("aria-describedby");
    expect(describedBy).toBeTruthy();
    expect(describedBy).toContain("dni-hint");
  });

  it("keeps the label htmlFor wiring pointing at the input id with an adornment", () => {
    render(
      <FormField
        id="dni"
        label="DNI"
        trailingAdornment={<Button type="button">Autofill</Button>}
      >
        <Input id="dni" />
      </FormField>,
    );
    const label = screen.getByText("DNI").closest("label")!;
    expect(label.tagName).toBe("LABEL");
    expect(label).toHaveAttribute("for", "dni");
    expect(document.getElementById("dni")).not.toBeNull();
  });

  it("renders an icon as adornment (e.g. a status indicator)", () => {
    const { container } = render(
      <FormField
        id="email"
        label="Email"
        trailingAdornment={
          <Loader2 aria-hidden="true" className="size-4 animate-spin" />
        }
      >
        <Input id="email" aria-label="Email" />
      </FormField>,
    );
    const input = screen.getByLabelText("Email");
    expect(input.className).toMatch(/\bflex-1\b/);
    // The icon must be present as a sibling of the input inside the flex row.
    const flexContainer = container.firstChild!.querySelector(
      ":scope > div",
    ) as HTMLElement;
    expect(flexContainer.querySelector("svg")).not.toBeNull();
  });

  it("renders a link as adornment (e.g. a help link next to the input)", () => {
    render(
      <FormField
        id="email"
        label="Email"
        trailingAdornment={
          <a href="/help" aria-label="Help">
            <ExternalLink className="size-4" />
          </a>
        }
      >
        <Input id="email" aria-label="Email" />
      </FormField>,
    );
    const link = screen.getByRole("link", { name: /help/i });
    expect(link).toBeInTheDocument();
    const input = screen.getByLabelText("Email");
    expect(input.className).toMatch(/\bflex-1\b/);
  });

  it("renders the error message below the flex row (not inside it)", () => {
    const { container } = render(
      <FormField
        id="dni"
        label="DNI"
        error="DNI must be 8 digits"
        trailingAdornment={<Button type="button">Autofill</Button>}
      >
        <Input id="dni" />
      </FormField>,
    );
    const wrapper = container.firstChild as HTMLElement;
    // Children of the wrapper: <label>, <div> (flex), <p role="alert">.
    expect(wrapper.children.length).toBe(3);
    const error = wrapper.querySelector('p[role="alert"]');
    expect(error).toHaveTextContent("DNI must be 8 digits");
    // The error must be a direct child of the wrapper, NOT nested inside the
    // flex container.
    const flexContainer = wrapper.querySelector(":scope > div") as HTMLElement;
    expect(flexContainer.querySelector('p[role="alert"]')).toBeNull();
  });
});
