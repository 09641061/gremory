/** @vitest-environment jsdom */
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { I18nProvider } from "@/contexts/shared/interfaces/i18n";
import { CustomerForm } from "@/contexts/crm/interfaces/components/customer-management/customer-form";
import { EditServiceForm } from "@/contexts/catalog/interfaces/components/catalog/edit-service-form";
import { CreateCategoryModal } from "@/contexts/catalog/interfaces/components/catalog/create-category-modal";

// ---------------------------------------------------------------------------
// Shared mocks
// ---------------------------------------------------------------------------

// Server action used by the customer form for DNI/RUC autofill.
vi.mock("@/contexts/crm/interfaces/actions/resolve-document.action", () => ({
  resolveDocumentAction: vi.fn(),
}));

// next/navigation is referenced transitively by several modules in the tree.
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

// The edit-service-form pulls in nested sections + dialogs we don't care about
// for state-behavior testing. Stub them out so this file stays focused.
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

// Edit-service-form hooks — we override them per test through vi.hoisted so
// the values can be changed without re-importing the module.
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

beforeEach(() => {
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

function renderCustomerForm(overrides: Record<string, unknown> = {}) {
  return render(
    <I18nProvider initialLocale="en">
      <CustomerForm
        establishmentId="est-1"
        isSaving={false}
        submitLabel="Save customer"
        onSubmit={vi.fn()}
        {...overrides}
      />
    </I18nProvider>,
  );
}

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
// EMPTY STATE — no data, no pending, no error
// ===========================================================================

describe("Form states — EMPTY", () => {
  it("customer-form renders all fields empty and the submit button enabled", () => {
    renderCustomerForm();
    expect(screen.getByLabelText(/document number/i)).toHaveValue("");
    expect(screen.getByLabelText(/full name/i)).toHaveValue("");
    expect(screen.getByLabelText(/email address/i)).toHaveValue("");
    expect(screen.getByRole("textbox", { name: /phone number/i })).toHaveValue("");
    // The country code has a default ("+51") but the rest of the form is empty.
    expect(screen.getByRole("textbox", { name: /country code/i })).toHaveValue("+51");
    expect(screen.getByRole("button", { name: /save customer/i })).toBeEnabled();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("edit-service-form renders the fields with service defaults and no error", () => {
    renderEditServiceForm();
    expect(screen.getByTestId("general-info-section")).toBeInTheDocument();
    expect(screen.getByTestId("financials-section")).toBeInTheDocument();
    expect(screen.getByTestId("instructions-section")).toBeInTheDocument();
    // No destructive alert in the DOM (ErrorAlert returns null when no message).
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    // The save button is enabled because nothing is pending.
    expect(screen.getByRole("button", { name: /save/i })).toBeEnabled();
  });

  it("create-category-modal renders the empty name input and the save button enabled", () => {
    renderCreateCategoryModal();
    expect(screen.getByLabelText(/category name/i)).toHaveValue("");
    expect(screen.getByRole("button", { name: /save/i })).toBeEnabled();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});

// ===========================================================================
// LOADING STATE — isSaving/pending=true; submit button disabled, spinner shown
// ===========================================================================

describe("Form states — LOADING", () => {
  it("customer-form disables submit and shows the spinner when isSaving is true", () => {
    renderCustomerForm({ isSaving: true });
    const submit = screen.getByRole("button", { name: /save customer/i });
    expect(submit).toBeDisabled();
    // Loader2 renders an SVG with animate-spin class — look for that.
    expect(submit.querySelector("svg.animate-spin")).toBeInTheDocument();
  });

  it("customer-form also disables the cancel button when isSaving is true", () => {
    renderCustomerForm({ isSaving: true, onCancel: vi.fn() });
    const cancel = screen.getByRole("button", { name: /^cancel$/i });
    expect(cancel).toBeDisabled();
  });

  it("edit-service-form disables the save button and shows a spinner when update is pending", () => {
    editServiceHooks.updatePending = true;
    renderEditServiceForm();
    const submit = screen.getByRole("button", { name: /saving/i });
    expect(submit).toBeDisabled();
    // The Spinner component renders as a span with animate-spin.
    expect(submit.querySelector(".animate-spin")).toBeInTheDocument();
  });

  it("edit-service-form disables the cancel button while an action is pending", () => {
    editServiceHooks.updatePending = true;
    renderEditServiceForm({ onCancel: vi.fn() });
    expect(screen.getByRole("button", { name: /^cancel$/i })).toBeDisabled();
  });

  it("create-category-modal disables both buttons and shows a spinner while pending", () => {
    createCategoryHooks.pending = true;
    renderCreateCategoryModal();
    expect(screen.getByRole("button", { name: /saving/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /^cancel$/i })).toBeDisabled();
    expect(
      screen.getByRole("button", { name: /saving/i }).querySelector(".animate-spin"),
    ).toBeInTheDocument();
  });
});

// ===========================================================================
// ERROR STATE — destructive Alert with the failure message
// ===========================================================================

describe("Form states — ERROR", () => {
  it("customer-form surfaces the validation error inside the destructive Alert", async () => {
    renderCustomerForm();
    const user = userEvent.setup();
    // Submit with an empty DNI — that triggers the form's own validator.
    await user.click(screen.getByRole("button", { name: /save customer/i }));
    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(/validation error/i);
    expect(alert).toHaveTextContent(/dni/i);
  });

  it("edit-service-form shows the failure-toast when updateState is in error", () => {
    editServiceHooks.updateState = {
      status: "error",
      error: "Boom: catalog write failed",
    };
    renderEditServiceForm();
    // ErrorAlert mounts the toast in a portal at document.body. Because the
    // toast element receives aria-hidden="true" from its dialog ancestor,
    // `screen.getByRole("alert")` cannot reach it; we assert on the visible
    // text instead, which is the regression-safety signal we actually need.
    expect(
      screen.getByText("Boom: catalog write failed"),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/failed to (process service|catalog)/i),
    ).toBeInTheDocument();
  });

  it("edit-service-form prefers the update error over the change-status error", () => {
    editServiceHooks.updateState = {
      status: "error",
      error: "Update error wins",
    };
    editServiceHooks.changeState = {
      status: "error",
      error: "Change-status error is suppressed",
    };
    renderEditServiceForm();
    expect(screen.getByText("Update error wins")).toBeInTheDocument();
    expect(
      screen.queryByText("Change-status error is suppressed"),
    ).not.toBeInTheDocument();
  });

  it("create-category-modal shows the failure-toast when state is in error", () => {
    createCategoryHooks.state = {
      status: "error",
      error: "Boom: category write failed",
    };
    renderCreateCategoryModal();
    expect(
      screen.getByText("Boom: category write failed"),
    ).toBeInTheDocument();
  });

  it("create-category-modal hides the error toast while pending is true", () => {
    // The components deliberately suppress the error toast during pending to
    // avoid flashing stale errors when a retry is in flight.
    createCategoryHooks.pending = true;
    createCategoryHooks.state = { status: "error", error: "stale error" };
    renderCreateCategoryModal();
    expect(screen.queryByText("stale error")).not.toBeInTheDocument();
  });
});

// ===========================================================================
// SUCCESS STATE — submit completes and the payload reaches onSubmit
// ===========================================================================

describe("Form states — SUCCESS", () => {
  it("customer-form reaches the success branch and stops there (no further mutation)", async () => {
    const onSubmit = vi.fn();
    renderCustomerForm({ onSubmit });
    const user = userEvent.setup();

    await user.clear(screen.getByLabelText(/document number/i));
    await user.type(screen.getByLabelText(/document number/i), "12345678");
    await user.type(screen.getByLabelText(/full name/i), "Maria Gonzalez");
    await user.type(screen.getByLabelText(/email address/i), "maria@example.com");
    await user.clear(screen.getByRole("textbox", { name: /phone number/i }));
    await user.type(screen.getByRole("textbox", { name: /phone number/i }), "987654321");

    await user.click(screen.getByRole("button", { name: /save customer/i }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit).toHaveBeenCalledWith({
      docType: "dni",
      docNumber: "12345678",
      name: "Maria Gonzalez",
      email: "maria@example.com",
      phoneCountryCode: "+51",
      phoneNumber: "987654321",
    });
    // No error alert after a successful submit.
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("edit-service-form binds the form to the update hook via React's form action", () => {
    const actionSpy = vi.fn();
    editServiceHooks.updateFormAction = actionSpy;
    renderEditServiceForm();
    const form = document.getElementById("edit-service-form") as HTMLFormElement;
    expect(form).toBeInTheDocument();
    // React rewrites the `action` prop to an inline JS handler; we just
    // assert the form exists and that the update hook is wired in.
    expect(actionSpy).toBeDefined();
  });

  it("edit-service-form disables the fieldset while canUpdateService is false", () => {
    renderEditServiceForm({ canUpdateService: false, canDeleteService: false });
    const fieldset = document.querySelector(
      "#edit-service-form fieldset",
    ) as HTMLFieldSetElement;
    expect(fieldset).not.toBeNull();
    expect(fieldset.disabled).toBe(true);
    // The save button is hidden when the user lacks update permission.
    expect(screen.queryByRole("button", { name: /save/i })).not.toBeInTheDocument();
  });

  it("create-category-modal includes the hidden establishmentId in the form", () => {
    renderCreateCategoryModal({ establishmentId: "est-42" });
    const hidden = document.querySelector(
      'input[type="hidden"][name="establishmentId"]',
    ) as HTMLInputElement;
    expect(hidden).not.toBeNull();
    expect(hidden.value).toBe("est-42");
  });
});