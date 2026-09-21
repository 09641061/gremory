/** @vitest-environment jsdom */
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { I18nProvider } from "@/contexts/shared/interfaces/i18n";
import { CustomerForm } from "@/contexts/crm/interfaces/components/customer-management/customer-form";
import { FormField } from "@/contexts/shared/interfaces/components/form/form-field";
import { Button } from "@/contexts/shared/interfaces/components/ui/button";
import { Input } from "@/contexts/shared/interfaces/components/ui/input";

// ---------------------------------------------------------------------------
// Shared mocks (mirrors customer-form-baseline.test.tsx — kept inline so
// this file is self-contained).
// ---------------------------------------------------------------------------

vi.mock("@/contexts/crm/interfaces/actions/resolve-document.action", () => ({
  resolveDocumentAction: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: vi.fn(),
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => "/crm",
  useSearchParams: () => new URLSearchParams(),
}));

import { resolveDocumentAction } from "@/contexts/crm/interfaces/actions/resolve-document.action";
const mockResolveDocumentAction = vi.mocked(resolveDocumentAction);

const baseProps = {
  establishmentId: "est-1",
  isSaving: false,
  submitLabel: "Save customer",
  onSubmit: vi.fn(),
};

function renderForm(
  overrides: {
    onSubmit?: ReturnType<typeof vi.fn>;
    initialData?: Parameters<typeof CustomerForm>[0]["initialData"];
  } = {},
) {
  const onSubmit = overrides.onSubmit ?? vi.fn();
  const { initialData } = overrides;
  const utils = render(
    <I18nProvider initialLocale="en">
      <CustomerForm
        {...baseProps}
        {...(initialData ? { initialData } : {})}
        onSubmit={onSubmit}
      />
    </I18nProvider>,
  );
  return { ...utils, onSubmit };
}

beforeEach(() => {
  vi.clearAllMocks();
  // Default mock — autofill is a no-op returning an error result so the
  // customer-form does not patch the name. Tests that want a different
  // resolution behaviour override this with `mockResolvedValueOnce(...)`.
  mockResolveDocumentAction.mockResolvedValue({
    status: "error",
    data: null,
    error: null,
    errorId: null,
    fieldErrors: null,
  });
});

// ===========================================================================
// 1. customer-form: doc_number has autofill Button visible (trailingAdornment)
// ===========================================================================

describe("Trailing adornment — customer-form autofill visibility", () => {
  it("renders the autofill Button inside the same flex container as the doc_number Input", () => {
    // For DNI: the autofill Button is FormField's trailingAdornment.
    // FormField wraps the Input + adornment in a single flex row, so both
    // must live as siblings of the same parent <div>.
    renderForm({ initialData: { docType: "dni" } });

    const docNumberInput = screen.getByLabelText(/document number/i);
    const autofillButton = screen.getByRole("button", { name: /autofill/i });

    expect(docNumberInput).toBeInTheDocument();
    expect(autofillButton).toBeInTheDocument();

    // The Button must NOT be the Input's parent (which is invalid HTML) and
    // must NOT be a direct child of the FormSection grid. It must share a
    // flex wrapper with the Input.
    const flexWrapper = docNumberInput.parentElement;
    expect(flexWrapper).not.toBeNull();
    expect(flexWrapper!.tagName).toBe("DIV");
    expect(flexWrapper!.className).toMatch(/\bflex\b/);
    // The autofill Button is the sibling of the Input inside that wrapper.
    expect(flexWrapper!.contains(autofillButton)).toBe(true);
    // Both elements are direct children of the flex wrapper.
    expect(flexWrapper!.children.length).toBe(2);
    expect(flexWrapper!.children[0]).toBe(docNumberInput);
    expect(flexWrapper!.children[1]).toBe(autofillButton);
  });

  it("renders the autofill Button with type=button so it does not submit the form", () => {
    // Regression guard: a Button inside a <form> with no type="button"
    // would default to type="submit" in HTML. CustomerForm uses
    // <Button type="button"> explicitly so the autofill click resolves
    // the document instead of submitting the form.
    renderForm({ initialData: { docType: "dni" } });
    const autofill = screen.getByRole("button", { name: /autofill/i });
    expect(autofill).toHaveAttribute("type", "button");
  });

  it("calls resolveDocumentAction with (docType, docNumber, establishmentId) on autofill click", async () => {
    renderForm({ initialData: { docType: "dni" } });
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/document number/i), "12345678");
    await user.click(screen.getByRole("button", { name: /autofill/i }));

    await waitFor(() => {
      expect(mockResolveDocumentAction).toHaveBeenCalledWith(
        "dni",
        "12345678",
        "est-1",
      );
    });
  });

  it("still keeps the Input inside the flex wrapper when its className is not flex-1 by default", () => {
    // FormField forwards flex-1 onto the Input by cloning the child.
    // This is the load-bearing className that lets the Input grow to
    // fill the row. Verify it is present.
    renderForm({ initialData: { docType: "dni" } });
    const docNumberInput = screen.getByLabelText(/document number/i);
    expect(docNumberInput.className).toMatch(/\bflex-1\b/);
  });
});

// ===========================================================================
// 2. customer-form: doc_number with validation error preserves accessibility
// ===========================================================================

describe("Trailing adornment — accessibility preserved on error", () => {
  it("shows the validation error inside a role=alert Alert above the form", async () => {
    // customer-form routes validation errors through useFormValidation
    // and surfaces them in the destructive Alert at the top of the form.
    // The Alert carries role="alert" so screen readers announce it.
    renderForm({ initialData: { docType: "dni" } });
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/document number/i), "123");
    await user.click(screen.getByRole("button", { name: /save customer/i }));

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(/validation error/i);
    expect(alert).toHaveTextContent(/dni/i);
    expect(alert).toHaveTextContent(/8 digits/i);
  });

  it("keeps the doc_number label htmlFor wiring intact after validation error", async () => {
    // Even when the Alert renders, the label → input binding must
    // continue to work, otherwise a screen reader loses the field name
    // when the user navigates back to it.
    renderForm({ initialData: { docType: "dni" } });
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/document number/i), "123");
    await user.click(screen.getByRole("button", { name: /save customer/i }));
    await screen.findByRole("alert");

    // The label-for contract: the implicit association through htmlFor
    // keeps `getByLabelText` resolving. We tighten by asserting the
    // underlying <label> carries `for="doc_number"` and the referenced
    // input still has the matching `id`.
    const label = screen.getByText(/document number/i).closest("label")!;
    expect(label).not.toBeNull();
    expect(label.tagName).toBe("LABEL");
    expect(label).toHaveAttribute("for", "doc_number");
    expect(document.getElementById("doc_number")).not.toBeNull();
  });

  it("keeps the autofill Button accessible after a validation error", async () => {
    // The autofill adornment must remain in the DOM, focusable and
    // clickable, even when the form has surfaced a validation error.
    // Otherwise the user cannot recover by re-running autofill after
    // editing the doc number.
    renderForm({ initialData: { docType: "dni" } });
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/document number/i), "123");
    await user.click(screen.getByRole("button", { name: /save customer/i }));
    await screen.findByRole("alert");

    const autofill = screen.getByRole("button", { name: /autofill/i });
    expect(autofill).toBeInTheDocument();
    // type="button" prevents the click from submitting the form, which
    // would re-trigger the same validation error loop.
    expect(autofill).toHaveAttribute("type", "button");
    // The autofill Button is disabled while docNumber is "123" — wait,
    // "123" is non-empty, so the button is enabled. The button is
    // disabled only when docNumber is empty.
    expect(autofill).toBeEnabled();
    // It is focusable / clickable end-to-end.
    autofill.focus();
    expect(document.activeElement).toBe(autofill);
  });

  it("forwards aria-describedby to the Input when a FormField has BOTH error and trailingAdornment", () => {
    // Isolated test: the FormField contract for error + adornment must
    // keep aria-describedby pointing at the error id. This pins the
    // behaviour so a future refactor does not silently strip the
    // describedby wiring when an adornment is present.
    const { container } = render(
      <FormField
        id="dni"
        label="DNI"
        error="DNI must be 8 digits"
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

    // The error <p role="alert"> with the matching id must exist in the
    // DOM and be reachable via document.getElementById.
    const errorEl = document.getElementById("dni-error");
    expect(errorEl).not.toBeNull();
    expect(errorEl!.getAttribute("role")).toBe("alert");
    expect(errorEl).toHaveTextContent("DNI must be 8 digits");

    // The error <p> is a sibling of the flex container, NOT a child of
    // it. Otherwise the alert would be hidden behind the adornment.
    const wrapper = container.firstChild as HTMLElement;
    const flexContainer = wrapper.querySelector(":scope > div") as HTMLElement;
    expect(flexContainer.contains(errorEl)).toBe(false);
    expect(wrapper.contains(errorEl)).toBe(true);
  });

  it("does NOT place the role=alert inside the flex container (alert stays below the row)", () => {
    // The flex container is purely structural — putting an alert inside
    // it would let the autofill Button steal screen-reader focus. The
    // error message must be a sibling of the flex container, rendered
    // AFTER it in DOM order.
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
    const wrapper = container.firstChild as HTMLElement;
    const children = Array.from(wrapper.children);
    // Expect: <label>, <div> (flex row), <p role="alert">.
    expect(children.length).toBe(3);
    expect(children[0]?.tagName).toBe("LABEL");
    expect(children[1]?.tagName).toBe("DIV");
    expect((children[1] as HTMLElement).className).toMatch(/\bflex\b/);
    expect(children[2]?.tagName).toBe("P");
    expect(children[2]?.getAttribute("role")).toBe("alert");
  });
});

// ===========================================================================
// 3. customer-form: autofill Button disables correctly
// ===========================================================================

describe("Trailing adornment — autofill disabled and loading states", () => {
  it("disables the autofill Button when docNumber is empty", () => {
    renderForm({ initialData: { docType: "dni" } });
    const autofill = screen.getByRole("button", { name: /autofill/i });
    expect(autofill).toBeDisabled();
  });

  it("enables the autofill Button once the user has typed any character", async () => {
    renderForm({ initialData: { docType: "dni" } });
    const user = userEvent.setup();

    const autofill = screen.getByRole("button", { name: /autofill/i });
    expect(autofill).toBeDisabled();

    await user.type(screen.getByLabelText(/document number/i), "1");
    expect(autofill).toBeEnabled();
  });

  it("disables the autofill Button again when the user clears the docNumber", async () => {
    renderForm({ initialData: { docType: "dni", docNumber: "12345678" } });
    expect(screen.getByRole("button", { name: /autofill/i })).toBeEnabled();

    const user = userEvent.setup();
    await user.clear(screen.getByLabelText(/document number/i));
    expect(screen.getByRole("button", { name: /autofill/i })).toBeDisabled();
  });

  it("does NOT render the autofill Button for non-DNI/RUC doc types (adornment slot is null)", () => {
    // passport and foreign_resident_card have no autofill, so
    // trailingAdornment is null and FormField drops the flex wrapper.
    // Without the wrapper, the Input is a direct child of the FormField
    // and the autofill Button is absent from the DOM.
    const passport = renderForm({
      initialData: { docType: "passport" },
    });
    expect(screen.queryByRole("button", { name: /autofill/i })).toBeNull();
    passport.unmount();

    const frc = renderForm({
      initialData: { docType: "foreign_resident_card" },
    });
    expect(screen.queryByRole("button", { name: /autofill/i })).toBeNull();
    frc.unmount();
  });

  it("replaces the autofill Button's text with a spinner while resolving the document", async () => {
    // Use a never-resolving promise so isResolving stays true for the
    // duration of the test. We assert on the synchronous DOM state right
    // after the click.
    mockResolveDocumentAction.mockImplementationOnce(
      () => new Promise(() => {}),
    );

    renderForm({ initialData: { docType: "dni" } });
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/document number/i), "12345678");

    // Pre-click: the autofill Button is in the flex wrapper next to the
    // Input and shows the autofill label. We grab it by its flex sibling
    // to avoid relying on the accessible name (the name only changes
    // when the spinner replaces the text).
    const docNumberInput = screen.getByLabelText(/document number/i);
    const flexRow = docNumberInput.parentElement as HTMLElement;
    const autofillBefore = flexRow.querySelector(
      "button",
    ) as HTMLButtonElement;
    expect(autofillBefore).not.toBeNull();
    expect(autofillBefore.textContent).toMatch(/autofill/i);

    await user.click(autofillBefore);

    // While resolving: the Button loses its visible label (now contains
    // only the spinner, which is aria-hidden so the accessible name is
    // empty), is disabled, and exposes the spinner via the .animate-spin
    // class. We wait for the next render to observe the resolved state.
    await waitFor(() => {
      const button = flexRow.querySelector(
        "button",
      ) as HTMLButtonElement | null;
      expect(button).not.toBeNull();
      // The button is now disabled.
      expect(button!.disabled).toBe(true);
      // The button contains an <svg> spinner.
      const spinner = button!.querySelector("svg.animate-spin");
      expect(spinner).not.toBeNull();
      // The autofill text label is no longer rendered inside the button.
      expect(button!.textContent).not.toMatch(/autofill/i);
    });
  });

  it("restores the autofill text and re-enables the Button once resolution completes", async () => {
    mockResolveDocumentAction.mockResolvedValueOnce({
      status: "error",
      data: null,
      error: null,
      errorId: null,
      fieldErrors: null,
    });

    renderForm({ initialData: { docType: "dni" } });
    const user = userEvent.setup();

    const docNumberInput = screen.getByLabelText(/document number/i);
    const flexRow = docNumberInput.parentElement as HTMLElement;
    const autofillBefore = flexRow.querySelector(
      "button",
    ) as HTMLButtonElement;

    await user.type(docNumberInput, "12345678");
    await user.click(autofillBefore);

    // After the (mocked) promise resolves, the spinner must be gone and
    // the button must be enabled again with the original label.
    await waitFor(() => {
      const button = flexRow.querySelector(
        "button",
      ) as HTMLButtonElement | null;
      expect(button).not.toBeNull();
      expect(button!.disabled).toBe(false);
      expect(button!.querySelector("svg.animate-spin")).toBeNull();
      expect(button!.textContent).toMatch(/autofill/i);
    });
  });
});

// ===========================================================================
// 4. Visual DOM order contract
// ===========================================================================

describe("Trailing adornment — DOM order", () => {
  it("renders Label, then flex container (Input + adornment), then form-level error in that order", () => {
    // When the consumer passes BOTH an error and a trailingAdornment, the
    // DOM order must be: <label> → <div flex>(Input + adornment) →
    // <p role="alert">. This is what the screen reader announces in
    // sequence, so the order is observable to assistive tech.
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
    const [label, flex, alert] = Array.from(wrapper.children);

    expect(label?.tagName).toBe("LABEL");
    expect(flex?.tagName).toBe("DIV");
    expect((flex as HTMLElement).className).toMatch(/\bflex\b/);
    expect(alert?.tagName).toBe("P");
    expect(alert?.getAttribute("role")).toBe("alert");
  });

  it("renders no extra wrapper div when trailingAdornment is undefined", () => {
    // Regression guard: the FormField wraps the Input in a flex container
    // ONLY when an adornment is present. Without an adornment, the Input
    // remains a direct child of the FormField wrapper so the DOM
    // topology of pre-adornment consumers does not shift.
    const { container } = render(
      <FormField id="email" label="Email">
        <Input id="email" aria-label="Email" />
      </FormField>,
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.children.length).toBe(2);
    expect(wrapper.children[0]?.tagName).toBe("LABEL");
    expect(wrapper.children[1]?.tagName).toBe("INPUT");
    // No flex container anywhere.
    expect(wrapper.querySelector(":scope > div")).toBeNull();
  });

  it("renders no extra wrapper div when trailingAdornment is explicitly null", () => {
    // CustomerForm passes `trailingAdornment={isDniOrRuc ? <Button…/> : null}`
    // — the `null` branch must collapse the flex wrapper, not render an
    // empty <div>.
    const { container } = render(
      <FormField id="email" label="Email" trailingAdornment={null}>
        <Input id="email" aria-label="Email" />
      </FormField>,
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.children.length).toBe(2);
    expect(wrapper.querySelector(":scope > div")).toBeNull();
  });

  it("places the autofill Button to the right of the Input inside the flex row", () => {
    renderForm({ initialData: { docType: "dni" } });
    const docNumberInput = screen.getByLabelText(/document number/i);
    const autofill = screen.getByRole("button", { name: /autofill/i });
    const flexRow = docNumberInput.parentElement as HTMLElement;
    // Direct children: [0] = Input, [1] = Button. This order is what
    // gives the visual "input on the left, action on the right" layout.
    expect(flexRow.children[0]).toBe(docNumberInput);
    expect(flexRow.children[1]).toBe(autofill);
    // Use the gap-2 utility to keep the two elements separated.
    expect(flexRow.className).toMatch(/\bgap-2\b/);
  });
});
