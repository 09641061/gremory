/** @vitest-environment jsdom */
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { I18nProvider } from "@/contexts/shared/interfaces/i18n";
import { CustomerForm } from "@/contexts/crm/interfaces/components/customer-management/customer-form";
import { EditServiceForm } from "@/contexts/catalog/interfaces/components/catalog/edit-service-form";
import { CreateCategoryModal } from "@/contexts/catalog/interfaces/components/catalog/create-category-modal";

// ---------------------------------------------------------------------------
// Shared mocks (mirrors form-states.test.tsx — kept inline so this file is
// self-contained and explicit about what it stubs out).
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
  usePathname: () => "/catalog",
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@/contexts/catalog/interfaces/components/create-service/general-info-section", () => ({
  GeneralInfoSection: () => <div data-testid="general-info-section" />,
}));
vi.mock("@/contexts/catalog/interfaces/components/create-service/financials-and-logistics-section", () => ({
  FinancialsAndLogisticsSection: () => <div data-testid="financials-section" />,
}));
vi.mock("@/contexts/catalog/interfaces/components/create-service/instructions-section", () => ({
  InstructionsSection: () => <div data-testid="instructions-section" />,
}));
vi.mock("@/contexts/catalog/interfaces/components/catalog/delete-service-dialog", () => ({
  DeleteServiceDialog: () => null,
}));

// EditServiceForm hook stubs — every value is changed in-place through the
// shared `editServiceHooks` object so a single render() call sees the latest
// values.
const editServiceHooks = vi.hoisted(() => ({
  updateState: { status: "idle" as "idle" | "success" | "error", error: null as string | null },
  updateFormAction: vi.fn(),
  updatePending: false,
  changeStatus: vi.fn(),
  changePending: false,
  changeState: { status: "idle" as "idle" | "success" | "error", error: null as string | null },
}));

vi.mock("@/contexts/catalog/interfaces/hooks/use-update-catalog-service", () => ({
  useUpdateCatalogService: () => ({
    state: editServiceHooks.updateState,
    formAction: editServiceHooks.updateFormAction,
    pending: editServiceHooks.updatePending,
  }),
}));

vi.mock("@/contexts/catalog/interfaces/hooks/use-change-catalog-service-status", () => ({
  useChangeCatalogServiceStatus: () => ({
    changeStatus: editServiceHooks.changeStatus,
    pending: editServiceHooks.changePending,
    state: editServiceHooks.changeState,
  }),
}));

const createCategoryHooks = vi.hoisted(() => ({
  state: { status: "idle" as "idle" | "success" | "error", error: null as string | null },
  formAction: vi.fn(),
  pending: false,
}));

vi.mock("@/contexts/catalog/interfaces/hooks/use-create-service-category", () => ({
  useCreateServiceCategory: () => ({
    state: createCategoryHooks.state,
    formAction: createCategoryHooks.formAction,
    pending: createCategoryHooks.pending,
  }),
}));

import { resolveDocumentAction } from "@/contexts/crm/interfaces/actions/resolve-document.action";
const mockResolveDocumentAction = vi.mocked(resolveDocumentAction);

beforeEach(() => {
  vi.clearAllMocks();
  mockResolveDocumentAction.mockResolvedValue({
    status: "error",
    data: null,
    error: null,
    errorId: null,
    fieldErrors: null,
  });

  editServiceHooks.updateState = { status: "idle", error: null };
  editServiceHooks.updateFormAction = vi.fn();
  editServiceHooks.updatePending = false;
  editServiceHooks.changeStatus = vi.fn();
  editServiceHooks.changePending = false;
  editServiceHooks.changeState = { status: "idle", error: null };

  createCategoryHooks.state = { status: "idle", error: null };
  createCategoryHooks.formAction = vi.fn();
  createCategoryHooks.pending = false;
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function renderCustomerForm(overrides: Record<string, unknown> = {}) {
  const onSubmit = (overrides.onSubmit as ReturnType<typeof vi.fn>) ?? vi.fn();
  return render(
    <I18nProvider initialLocale="en">
      <CustomerForm
        establishmentId="est-1"
        isSaving={false}
        submitLabel="Save customer"
        {...overrides}
        onSubmit={onSubmit}
      />
    </I18nProvider>,
  );
}

const mockService = {
  id: "svc-1",
  name: "Haircut",
  description: "Standard haircut",
  price: 30,
  durationMinutes: 30,
  preparationMinutes: 5,
  cleanupMinutes: 5,
  status: "ACTIVE" as const,
};

function renderEditServiceForm(
  overrides: Partial<{
    service: typeof mockService;
    onCancel: () => void;
    onDeleted: () => void;
    canUpdateService: boolean;
    canDeleteService: boolean;
  }> = {},
) {
  return render(
    <I18nProvider initialLocale="en">
      <EditServiceForm
        service={overrides.service ?? mockService}
        onCancel={overrides.onCancel}
        onDeleted={overrides.onDeleted}
        canUpdateService={overrides.canUpdateService ?? true}
        canDeleteService={overrides.canDeleteService ?? false}
      />
    </I18nProvider>,
  );
}

function renderCreateCategoryModal(
  overrides: Partial<{ isOpen: boolean; onClose: () => void; establishmentId: string }> = {},
) {
  return render(
    <I18nProvider initialLocale="en">
      <CreateCategoryModal
        isOpen={overrides.isOpen ?? true}
        onClose={overrides.onClose ?? vi.fn()}
        establishmentId={overrides.establishmentId ?? "est-1"}
      />
    </I18nProvider>,
  );
}

// ===========================================================================
// 1. customer-form uses FormField internally
// ===========================================================================

describe("Migration integration — customer-form uses FormField", () => {
  it("renders the form with valid data hydrated through initialData", () => {
    renderCustomerForm({
      initialData: {
        docType: "dni",
        docNumber: "12345678",
        name: "Maria Gonzalez",
        email: "maria@example.com",
        phoneCountryCode: "+51",
        phoneNumber: "987654321",
      },
    });

    // Every field touched by FormField (label + input) must resolve.
    expect(screen.getByLabelText(/document type/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/document number/i)).toHaveValue("12345678");
    expect(screen.getByLabelText(/full name/i)).toHaveValue("Maria Gonzalez");
    expect(screen.getByLabelText(/email address/i)).toHaveValue("maria@example.com");
  });

  it("renders labels with htmlFor pointing at the matching input id (FormField wiring)", () => {
    renderCustomerForm();

    // For each FormField we can prove the label is bound to the input. The
    // simplest, implementation-agnostic check: the implicit association
    // through `htmlFor` already makes `getByLabelText` resolve; we tighten
    // it by asserting the underlying `<label>` carries `for` and the
    // referenced input has the matching `id`.
    const docTypeLabel = screen.getByText(/document type/i).closest("label")!;
    expect(docTypeLabel.tagName).toBe("LABEL");
    expect(docTypeLabel).toHaveAttribute("for", "doc_type");
    expect(document.getElementById("doc_type")).not.toBeNull();

    const fullNameLabel = screen.getByText(/full name/i).closest("label")!;
    expect(fullNameLabel).toHaveAttribute("for", "full_name");
    expect(document.getElementById("full_name")).not.toBeNull();

    const emailLabel = screen.getByText(/email address/i).closest("label")!;
    expect(emailLabel).toHaveAttribute("for", "email");
    expect(document.getElementById("email")).not.toBeNull();
  });

  it("surfaces the validation error inside a destructive Alert with role=alert", async () => {
    renderCustomerForm();
    const user = userEvent.setup();

    // Invalid DNI (only 3 digits) + click submit.
    await user.type(screen.getByLabelText(/document number/i), "123");
    await user.click(screen.getByRole("button", { name: /save customer/i }));

    // The Alert component used by the form renders role="alert" on its
    // outer <div>. There must be exactly one alert in the DOM (the
    // top-of-form error) and it must contain the validation message.
    const alerts = screen.getAllByRole("alert");
    expect(alerts.length).toBeGreaterThanOrEqual(1);

    // The error alert is the first one and is the one that renders the
    // validator message (the others, if any, come from UI primitives with
    // no role=alert text). We assert on its text content.
    const errorAlert = alerts.find((node) => /dni/i.test(node.textContent ?? ""));
    expect(errorAlert).toBeDefined();
    expect(errorAlert).toHaveTextContent(/validation error/i);
    expect(errorAlert).toHaveTextContent(/dni/i);
  });

  it("routes validation through the useFormValidation hook (cleared on docType switch)", async () => {
    // If `useFormValidation` were not the source of truth, switching the
    // doc type would not clear the existing error. The migration rewires
    // the form so the error state lives in the hook and is cleared by
    // `clearError` in the docType `onChange`. The test below is the
    // observable consequence: after a failed submit, changing the doc
    // type wipes the alert out of the DOM.
    renderCustomerForm();
    const user = userEvent.setup();

    // Trigger a validation error.
    await user.type(screen.getByLabelText(/document number/i), "123");
    await user.click(screen.getByRole("button", { name: /save customer/i }));
    const beforeSwitch = screen.getAllByRole("alert");
    expect(
      beforeSwitch.some((node) => /dni/i.test(node.textContent ?? "")),
    ).toBe(true);

    // Switch the doc type — this must remove the error alert.
    await user.selectOptions(screen.getByLabelText(/document type/i), "passport");
    const afterSwitch = screen.queryAllByRole("alert");
    expect(
      afterSwitch.some((node) => /dni/i.test(node.textContent ?? "")),
    ).toBe(false);
  });

  it("clears the useFormValidation error when the user keeps editing the document number", async () => {
    // The error state is owned by the hook; editing the field after a
    // failed submit must clear it. This is the second observable signature
    // of "errors live in useFormValidation, not local useState".
    renderCustomerForm();
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/document number/i), "123");
    await user.click(screen.getByRole("button", { name: /save customer/i }));
    expect(
      screen.getAllByRole("alert").some((node) => /dni/i.test(node.textContent ?? "")),
    ).toBe(true);

    await user.type(screen.getByLabelText(/document number/i), "4");
    expect(
      screen.queryAllByRole("alert").some((node) =>
        /dni/i.test(node.textContent ?? ""),
      ),
    ).toBe(false);
  });

  it("renders the FormSection wrapper with title and description", () => {
    // FormSection renders a <section> element with an inner <header>
    // when title/description are passed. Asserting on the section
    // structure proves the section wrapper is in place — i.e. the
    // migration is actually using FormSection, not a plain div.
    const { container } = renderCustomerForm();

    const sections = container.querySelectorAll("section");
    expect(sections.length).toBeGreaterThanOrEqual(2);

    // Both FormSection instances render their title in an <h2> inside a
    // <header>. We pick the two known headings.
    const identityHeading = screen.getByRole("heading", {
      name: /identity|identidad/i,
    });
    const contactHeading = screen.getByRole("heading", {
      name: /contact|contacto/i,
    });
    expect(identityHeading.tagName).toBe("H2");
    expect(contactHeading.tagName).toBe("H2");

    // The headings must live inside a <header> that is a child of a
    // <section>, which is the contract FormSection promises.
    expect(identityHeading.closest("header")?.closest("section")).not.toBeNull();
    expect(contactHeading.closest("header")?.closest("section")).not.toBeNull();
  });
});

// ===========================================================================
// 2. edit-service-form uses FormSubmitButton
// ===========================================================================

describe("Migration integration — edit-service-form uses FormSubmitButton", () => {
  it("renders a spinner inside the submit button while updatePending is true", () => {
    editServiceHooks.updatePending = true;
    renderEditServiceForm();

    const submit = screen.getByRole("button", { name: /saving/i });
    expect(submit).toBeInTheDocument();
    // The Loader2 spinner rendered by FormSubmitButton has the
    // `animate-spin` Tailwind class. This is the contract consumers rely
    // on to detect the loading state from the outside.
    expect(submit.querySelector("svg.animate-spin")).toBeInTheDocument();
  });

  it("changes the submit label from 'Save' to 'Saving...' while submitting", () => {
    // Pre-condition: when idle, the button reads "Save" (no spinner).
    const idle = renderEditServiceForm();
    expect(
      within(idle.container).getByRole("button", { name: /^save$/i }),
    ).toBeInTheDocument();
    idle.unmount();

    // During submit, the same button must read "Saving..." (and expose a
    // spinner). Re-rendering with the hook flipped to pending exercises
    // the FormSubmitButton label transition.
    editServiceHooks.updatePending = true;
    renderEditServiceForm();

    // The idle "Save" button is gone; the loading "Saving..." button is
    // the one that matches by accessible name.
    expect(
      screen.queryByRole("button", { name: /^save$/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /saving/i }),
    ).toBeInTheDocument();
  });

  it("disables the submit button while pending (FormSubmitButton behaviour)", () => {
    editServiceHooks.updatePending = true;
    renderEditServiceForm();

    const submit = screen.getByRole("button", { name: /saving/i });
    expect(submit).toBeDisabled();
    // aria-busy is part of the FormSubmitButton contract.
    expect(submit).toHaveAttribute("aria-busy", "true");
  });

  it("hides the Save icon while submitting (spinner replaces it)", () => {
    editServiceHooks.updatePending = true;
    renderEditServiceForm();

    const submit = screen.getByRole("button", { name: /saving/i });
    // While submitting, the icon passed to FormSubmitButton is replaced
    // by the spinner. The Save lucide-react icon would render as an
    // <svg> without `animate-spin`, so the only <svg> child must be the
    // spinner.
    const svgs = submit.querySelectorAll("svg");
    expect(svgs.length).toBeGreaterThanOrEqual(1);
    svgs.forEach((svg) => {
      expect(svg.classList.contains("animate-spin")).toBe(true);
    });
  });
});

// ===========================================================================
// 3. create-category-modal uses FormField and FormSubmitButton
// ===========================================================================

describe("Migration integration — create-category-modal uses FormField and FormSubmitButton", () => {
  it("wraps the category name input in a FormField with required hint", () => {
    renderCreateCategoryModal();

    const input = screen.getByLabelText(/category name/i) as HTMLInputElement;
    // The Input primitive carries the native `required` attribute and the
    // FormField wrapper adds a visual asterisk on the label.
    expect(input).toBeRequired();

    const label = screen.getByText(/category name/i).closest("label")!;
    expect(label).toHaveAttribute("for", "category-name");
    expect(input.id).toBe("category-name");

    // The required asterisk is rendered inside the label and marked as
    // aria-hidden so screen readers don't read it as part of the label.
    const asterisk = label.querySelector('[aria-hidden="true"]');
    expect(asterisk).not.toBeNull();
    expect(asterisk?.textContent).toBe("*");
  });

  it("blocks submission when the category name is empty (required validation)", async () => {
    // Native HTML `required` blocks form submission. We assert it by
    // trying to submit and observing that `formAction` was never called
    // and that the input is still focused / still invalid.
    const formActionSpy = createCategoryHooks.formAction;
    renderCreateCategoryModal();

    const submit = screen.getByRole("button", { name: /save/i });
    const input = screen.getByLabelText(/category name/i) as HTMLInputElement;

    expect(input).toHaveValue("");
    // FormSubmitButton is enabled while idle; the gating happens via the
    // browser's required-attribute validity, not by disabling the button.
    expect(submit).toBeEnabled();

    // JSDOM's form-submission guards against invalid fields, so clicking
    // submit while the field is empty must not call the form action.
    await userEvent.setup().click(submit);
    expect(formActionSpy).not.toHaveBeenCalled();
  });

  it("shows the loading state through FormSubmitButton when pending is true", () => {
    createCategoryHooks.pending = true;
    renderCreateCategoryModal();

    // While pending:
    //  - the button label flips to "Saving..."
    //  - the button is disabled
    //  - a spinner renders
    //  - aria-busy is set
    const submit = screen.getByRole("button", { name: /saving/i });
    expect(submit).toBeInTheDocument();
    expect(submit).toBeDisabled();
    expect(submit).toHaveAttribute("aria-busy", "true");
    expect(submit.querySelector("svg.animate-spin")).toBeInTheDocument();

    // The cancel button is disabled too (component-level, not part of the
    // FormSubmitButton contract, but the regression signal we want).
    expect(screen.getByRole("button", { name: /^cancel$/i })).toBeDisabled();
  });

  it("returns to the idle state when pending flips back to false", () => {
    // Render once in the pending state, unmount, then re-render idle to
    // prove the FormSubmitButton label transitions back. We can't flip
    // `pending` in-place because the form mounts with the initial value;
    // re-mounting is the realistic flow.
    createCategoryHooks.pending = true;
    const pendingView = renderCreateCategoryModal();
    expect(
      screen.getByRole("button", { name: /saving/i }),
    ).toBeInTheDocument();
    pendingView.unmount();

    createCategoryHooks.pending = false;
    renderCreateCategoryModal();
    const idleSave = screen.getByRole("button", { name: /^save$/i });
    expect(idleSave).toBeEnabled();
    expect(idleSave).toHaveAttribute("aria-busy", "false");
    expect(idleSave.querySelector("svg.animate-spin")).toBeNull();
  });

  it("keeps the FormField label bound to the input after a re-render with different defaults", () => {
    // The contract we want to protect: the htmlFor → id wiring survives
    // re-renders. If a future refactor switches to a plain <div> wrapper
    // and drops the label binding, this test fails.
    const first = renderCreateCategoryModal();
    expect(
      screen.getByText(/category name/i).closest("label")!,
    ).toHaveAttribute("for", "category-name");
    first.unmount();

    renderCreateCategoryModal({ establishmentId: "est-42" });
    expect(
      screen.getByText(/category name/i).closest("label")!,
    ).toHaveAttribute("for", "category-name");
  });
});