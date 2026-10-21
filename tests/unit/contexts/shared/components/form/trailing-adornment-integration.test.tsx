/** @vitest-environment jsdom */
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";

import { FormField } from "@/contexts/shared/interfaces/components/form/form-field";
import { Button } from "@/contexts/shared/interfaces/components/ui/button";
import { Input } from "@/contexts/shared/interfaces/components/ui/input";

// ===========================================================================
// 1. FormField: trailingAdornment slot visibility and flex container
// ===========================================================================

describe("Trailing adornment — FormField slot visibility", () => {
  it("renders the adornment inside the same flex container as the Input", () => {
    render(
      <FormField
        id="doc_number"
        label="Document number"
        trailingAdornment={<Button type="button">Action</Button>}
      >
        <Input id="doc_number" />
      </FormField>,
    );

    const input = screen.getByLabelText(/document number/i);
    const actionButton = screen.getByRole("button", { name: /action/i });

    expect(input).toBeInTheDocument();
    expect(actionButton).toBeInTheDocument();

    const flexWrapper = input.parentElement;
    expect(flexWrapper).not.toBeNull();
    expect(flexWrapper!.tagName).toBe("DIV");
    expect(flexWrapper!.className).toMatch(/\bflex\b/);
    expect(flexWrapper!.contains(actionButton)).toBe(true);
    expect(flexWrapper!.children.length).toBe(2);
    expect(flexWrapper!.children[0]).toBe(input);
    expect(flexWrapper!.children[1]).toBe(actionButton);
  });

  it("renders the Button with type=button so it does not submit forms", () => {
    render(
      <FormField
        id="doc_number"
        label="Document number"
        trailingAdornment={<Button type="button">Action</Button>}
      >
        <Input id="doc_number" />
      </FormField>,
    );

    const actionButton = screen.getByRole("button", { name: /action/i });
    expect(actionButton).toHaveAttribute("type", "button");
  });

  it("still keeps the Input inside the flex wrapper with flex-1", () => {
    render(
      <FormField
        id="doc_number"
        label="Document number"
        trailingAdornment={<Button type="button">Action</Button>}
      >
        <Input id="doc_number" />
      </FormField>,
    );

    const input = screen.getByLabelText(/document number/i);
    expect(input.className).toMatch(/\bflex-1\b/);
  });
});

// ===========================================================================
// 2. FormField: accessibility preserved with error and trailingAdornment
// ===========================================================================

describe("Trailing adornment — accessibility preserved on error", () => {
  it("forwards aria-describedby to the Input when a FormField has BOTH error and trailingAdornment", () => {
    const { container } = render(
      <FormField
        id="dni"
        label="DNI"
        error="DNI must be 8 digits"
        trailingAdornment={<Button type="button">Verify</Button>}
      >
        <Input id="dni" aria-label="DNI" />
      </FormField>,
    );

    const input = screen.getByLabelText("DNI");
    expect(input).toHaveAttribute("aria-invalid", "true");

    const describedBy = input.getAttribute("aria-describedby");
    expect(describedBy).toBeTruthy();
    expect(describedBy).toContain("dni-error");

    const errorEl = document.getElementById("dni-error");
    expect(errorEl).not.toBeNull();
    expect(errorEl!.getAttribute("role")).toBe("alert");
    expect(errorEl).toHaveTextContent("DNI must be 8 digits");

    const wrapper = container.firstChild as HTMLElement;
    const flexContainer = wrapper.querySelector(":scope > div") as HTMLElement;
    expect(flexContainer.contains(errorEl)).toBe(false);
    expect(wrapper.contains(errorEl)).toBe(true);
  });

  it("does NOT place the role=alert inside the flex container (alert stays below the row)", () => {
    const { container } = render(
      <FormField
        id="dni"
        label="DNI"
        error="invalid"
        trailingAdornment={<Button type="button">Verify</Button>}
      >
        <Input id="dni" />
      </FormField>,
    );
    const wrapper = container.firstChild as HTMLElement;
    const children = Array.from(wrapper.children);
    expect(children.length).toBe(3);
    expect(children[0]?.tagName).toBe("LABEL");
    expect(children[1]?.tagName).toBe("DIV");
    expect((children[1] as HTMLElement).className).toMatch(/\bflex\b/);
    expect(children[2]?.tagName).toBe("P");
    expect(children[2]?.getAttribute("role")).toBe("alert");
  });
});

// ===========================================================================
// 3. FormField: interactive adornment states
// ===========================================================================

describe("Trailing adornment — interactive states", () => {
  it("allows clicking the adornment button and triggers its callback", async () => {
    const handleClick = vi.fn();
    render(
      <FormField
        id="search"
        label="Search"
        trailingAdornment={<Button type="button" onClick={handleClick}>Search</Button>}
      >
        <Input id="search" />
      </FormField>,
    );
    const user = userEvent.setup();
    const button = screen.getByRole("button", { name: /search/i });

    await user.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("renders disabled adornment button when disabled prop is set", () => {
    render(
      <FormField
        id="search"
        label="Search"
        trailingAdornment={<Button type="button" disabled>Disabled</Button>}
      >
        <Input id="search" />
      </FormField>,
    );
    expect(screen.getByRole("button", { name: /disabled/i })).toBeDisabled();
  });
});

// ===========================================================================
// 4. Visual DOM order contract
// ===========================================================================

describe("Trailing adornment — DOM order", () => {
  it("renders Label, then flex container (Input + adornment), then form-level error in that order", () => {
    const { container } = render(
      <FormField
        id="dni"
        label="DNI"
        error="DNI must be 8 digits"
        trailingAdornment={<Button type="button">Verify</Button>}
      >
        <Input id="dni" />
      </FormField>,
    );

    const wrapper = container.firstChild as HTMLElement;
    const [label, flex, alert] = Array.from(wrapper.children);

    expect(label?.tagName).toBe("LABEL");
    expect(flex?.tagName).toBe("DIV");
    expect((flex as HTMLElement).className).toMatch(/\bflex\b/);
    expect(alert?.tagName).toBe("P");
    expect(alert?.getAttribute("role")).toBe("alert");
  });

  it("renders no extra wrapper div when trailingAdornment is undefined", () => {
    const { container } = render(
      <FormField id="email" label="Email">
        <Input id="email" aria-label="Email" />
      </FormField>,
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.children.length).toBe(2);
    expect(wrapper.children[0]?.tagName).toBe("LABEL");
    expect(wrapper.children[1]?.tagName).toBe("INPUT");
    expect(wrapper.querySelector(":scope > div")).toBeNull();
  });

  it("renders no extra wrapper div when trailingAdornment is explicitly null", () => {
    const { container } = render(
      <FormField id="email" label="Email" trailingAdornment={null}>
        <Input id="email" aria-label="Email" />
      </FormField>,
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.children.length).toBe(2);
    expect(wrapper.querySelector(":scope > div")).toBeNull();
  });

  it("places the adornment Button to the right of the Input inside the flex row", () => {
    render(
      <FormField
        id="doc_number"
        label="Document number"
        trailingAdornment={<Button type="button">Verify</Button>}
      >
        <Input id="doc_number" />
      </FormField>,
    );
    const input = screen.getByLabelText(/document number/i);
    const verifyButton = screen.getByRole("button", { name: /verify/i });
    const flexRow = input.parentElement as HTMLElement;
    expect(flexRow.children[0]).toBe(input);
    expect(flexRow.children[1]).toBe(verifyButton);
    expect(flexRow.className).toMatch(/\bgap-2\b/);
  });
});
