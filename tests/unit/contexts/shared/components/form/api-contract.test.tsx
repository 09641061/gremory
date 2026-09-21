/** @vitest-environment jsdom */
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { I18nProvider } from "@/contexts/shared/interfaces/i18n";
import { CustomerForm } from "@/contexts/crm/interfaces/components/customer-management/customer-form";
import { EditServiceForm } from "@/contexts/catalog/interfaces/components/catalog/edit-service-form";
import { CreateCategoryModal } from "@/contexts/catalog/interfaces/components/catalog/create-category-modal";

// ---------------------------------------------------------------------------
// This file is a REGRESSION GUARD for the public prop contracts of the three
// migrated forms. Future refactors that:
//   - rename a prop
//   - make a prop required that was optional (or vice-versa)
//   - drop a prop entirely
// must update the corresponding baseline below AND justify the breaking
// change. The tests only check that the *current* TypeScript-typed shape
// continues to render without runtime errors — they are not snapshot tests.
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

// Explicit cleanup between every test so render() calls don't accumulate
// portals/Dialogs in the JSDOM document.
afterEach(() => {
  cleanup();
});

// ===========================================================================
// 1. CustomerForm — props: initialData, onSubmit, onCancel, isSaving,
//                   submitLabel, submitIcon, establishmentId
// ===========================================================================

describe("API contract — CustomerForm props", () => {
  it("accepts initialData as an optional prop and hydrates from it when present", () => {
    render(
      <I18nProvider initialLocale="en">
        <CustomerForm
          establishmentId="est-1"
          isSaving={false}
          submitLabel="Save"
          onSubmit={vi.fn()}
          initialData={{ docType: "dni", docNumber: "12345678", name: "Maria" }}
        />
      </I18nProvider>,
    );
    expect(screen.getByLabelText(/document number/i)).toHaveValue("12345678");
    expect(screen.getByLabelText(/full name/i)).toHaveValue("Maria");
  });

  it("accepts initialData as an optional prop and renders empty fields when omitted", () => {
    render(
      <I18nProvider initialLocale="en">
        <CustomerForm
          establishmentId="est-1"
          isSaving={false}
          submitLabel="Save"
          onSubmit={vi.fn()}
        />
      </I18nProvider>,
    );
    expect(screen.getByLabelText(/document number/i)).toHaveValue("");
    expect(screen.getByLabelText(/full name/i)).toHaveValue("");
  });

  it("accepts onSubmit as a required prop and invokes it on a valid submit", async () => {
    const onSubmit = vi.fn();
    render(
      <I18nProvider initialLocale="en">
        <CustomerForm
          establishmentId="est-1"
          isSaving={false}
          submitLabel="Save"
          onSubmit={onSubmit}
        />
      </I18nProvider>,
    );

    const user = userEvent.setup();
    await user.type(screen.getByLabelText(/document number/i), "12345678");
    await user.type(screen.getByLabelText(/full name/i), "Maria");
    await user.type(screen.getByLabelText(/email address/i), "maria@example.com");
    await user.clear(screen.getByRole("textbox", { name: /phone number/i }));
    await user.type(screen.getByRole("textbox", { name: /phone number/i }), "987654321");

    await user.click(screen.getByRole("button", { name: /^save$/i }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it("accepts onCancel as an optional prop (renders Cancel iff provided)", () => {
    const onCancel = vi.fn();

    // With onCancel → renders the Cancel button.
    render(
      <I18nProvider initialLocale="en">
        <CustomerForm
          establishmentId="est-1"
          isSaving={false}
          submitLabel="Save"
          onSubmit={vi.fn()}
          onCancel={onCancel}
        />
      </I18nProvider>,
    );
    expect(screen.getByRole("button", { name: /^cancel$/i })).toBeInTheDocument();
  });

  it("does NOT render the Cancel button when onCancel is omitted", () => {
    // Without onCancel → no Cancel button in the DOM.
    render(
      <I18nProvider initialLocale="en">
        <CustomerForm
          establishmentId="est-1"
          isSaving={false}
          submitLabel="Save"
          onSubmit={vi.fn()}
        />
      </I18nProvider>,
    );
    expect(screen.queryByRole("button", { name: /^cancel$/i })).not.toBeInTheDocument();
  });

  it("accepts isSaving=false and renders the submit button enabled", () => {
    render(
      <I18nProvider initialLocale="en">
        <CustomerForm
          establishmentId="est-1"
          isSaving={false}
          submitLabel="Save"
          onSubmit={vi.fn()}
        />
      </I18nProvider>,
    );
    expect(screen.getByRole("button", { name: /^save$/i })).toBeEnabled();
  });

  it("accepts isSaving=true and disables the submit button + shows a spinner", () => {
    render(
      <I18nProvider initialLocale="en">
        <CustomerForm
          establishmentId="est-1"
          isSaving={true}
          submitLabel="Save"
          onSubmit={vi.fn()}
        />
      </I18nProvider>,
    );
    const submit = screen.getByRole("button", { name: /^save$/i });
    expect(submit).toBeDisabled();
    expect(submit.querySelector("svg.animate-spin")).toBeInTheDocument();
  });

  it("accepts submitLabel as a required string prop and renders it", () => {
    render(
      <I18nProvider initialLocale="en">
        <CustomerForm
          establishmentId="est-1"
          isSaving={false}
          submitLabel="Create customer"
          onSubmit={vi.fn()}
        />
      </I18nProvider>,
    );
    expect(
      screen.getByRole("button", { name: /create customer/i }),
    ).toBeInTheDocument();
  });

  it("accepts submitIcon as an optional ReactNode prop and renders it inside the button", () => {
    render(
      <I18nProvider initialLocale="en">
        <CustomerForm
          establishmentId="est-1"
          isSaving={false}
          submitLabel="Save"
          onSubmit={vi.fn()}
          submitIcon={<span data-testid="submit-icon" />}
        />
      </I18nProvider>,
    );
    expect(screen.getByTestId("submit-icon")).toBeInTheDocument();
  });

  it("renders without a submit icon when submitIcon is omitted", () => {
    render(
      <I18nProvider initialLocale="en">
        <CustomerForm
          establishmentId="est-1"
          isSaving={false}
          submitLabel="Save"
          onSubmit={vi.fn()}
        />
      </I18nProvider>,
    );
    // No submit-icon test marker → the contract requires the button to
    // render fine without an icon (no crash, no broken layout).
    expect(screen.getByRole("button", { name: /^save$/i })).toBeInTheDocument();
    expect(screen.queryByTestId("submit-icon")).not.toBeInTheDocument();
  });

  it("accepts establishmentId as a required string prop and forwards it to resolveDocumentAction", async () => {
    render(
      <I18nProvider initialLocale="en">
        <CustomerForm
          establishmentId="est-42"
          isSaving={false}
          submitLabel="Save"
          onSubmit={vi.fn()}
        />
      </I18nProvider>,
    );

    // The autofill button is the only place establishmentId is observable
    // from the outside (it's forwarded to resolveDocumentAction). Clicking
    // it should call the mock with "est-42".
    const user = userEvent.setup();
    await user.type(screen.getByLabelText(/document number/i), "12345678");
    await user.click(screen.getByRole("button", { name: /autofill/i }));

    expect(mockResolveDocumentAction).toHaveBeenCalledWith(
      "dni",
      "12345678",
      "est-42",
    );
  });
});

// ===========================================================================
// 2. EditServiceForm — props: service, onCancel, onDeleted,
//                      canUpdateService, canDeleteService
// ===========================================================================

describe("API contract — EditServiceForm props", () => {
  const baseService = {
    id: "svc-1",
    name: "Haircut",
    description: "Standard haircut",
    price: 30,
    durationMinutes: 30,
    preparationMinutes: 5,
    cleanupMinutes: 5,
    status: "ACTIVE" as const,
  };

  it("accepts service as a required prop and hydrates the form from it", () => {
    render(
      <I18nProvider initialLocale="en">
        <EditServiceForm
          service={baseService}
          canUpdateService={true}
          canDeleteService={false}
        />
      </I18nProvider>,
    );
    expect(document.getElementById("edit-service-form")).toBeInTheDocument();
    expect(screen.getByTestId("general-info-section")).toBeInTheDocument();
  });

  it("accepts onCancel as an optional prop and renders the Cancel button wired to it", async () => {
    const onCancel = vi.fn();
    render(
      <I18nProvider initialLocale="en">
        <EditServiceForm
          service={baseService}
          onCancel={onCancel}
          canUpdateService={true}
          canDeleteService={false}
        />
      </I18nProvider>,
    );
    const cancel = screen.getByRole("button", { name: /^cancel$/i });
    expect(cancel).toBeInTheDocument();
    await userEvent.setup().click(cancel);
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("renders a Cancel button even when onCancel is omitted (falls back to router.push)", () => {
    // The EditServiceForm Cancel button is unconditional: when onCancel is
    // omitted, clicking Cancel falls back to `router.push("/catalog")`.
    // We document this contract here so a future refactor that makes the
    // button conditional (like CustomerForm) must update this test.
    render(
      <I18nProvider initialLocale="en">
        <EditServiceForm
          service={baseService}
          canUpdateService={true}
          canDeleteService={false}
        />
      </I18nProvider>,
    );
    expect(screen.getByRole("button", { name: /^cancel$/i })).toBeInTheDocument();
  });

  it("accepts onDeleted as an optional prop without crashing when omitted", () => {
    // The DeleteServiceDialog is stubbed to null so we cannot observe the
    // prop being passed directly. The contract we check is: the form
    // mounts cleanly without onDeleted.
    expect(() =>
      render(
        <I18nProvider initialLocale="en">
          <EditServiceForm
            service={baseService}
            canUpdateService={true}
            canDeleteService={true}
          />
        </I18nProvider>,
      ),
    ).not.toThrow();
    expect(screen.getByTestId("general-info-section")).toBeInTheDocument();
  });

  it("renders the save button when canUpdateService=true", () => {
    render(
      <I18nProvider initialLocale="en">
        <EditServiceForm
          service={baseService}
          canUpdateService={true}
          canDeleteService={false}
        />
      </I18nProvider>,
    );
    expect(screen.getByRole("button", { name: /^save$/i })).toBeInTheDocument();
  });

  it("hides the save button and disables the fieldset when canUpdateService=false", () => {
    render(
      <I18nProvider initialLocale="en">
        <EditServiceForm
          service={baseService}
          canUpdateService={false}
          canDeleteService={false}
        />
      </I18nProvider>,
    );
    expect(screen.queryByRole("button", { name: /^save$/i })).not.toBeInTheDocument();
    const fieldset = document.querySelector(
      "#edit-service-form fieldset",
    ) as HTMLFieldSetElement | null;
    expect(fieldset).not.toBeNull();
    expect(fieldset!.disabled).toBe(true);
  });

  it("accepts canDeleteService as a boolean prop without crashing when true", () => {
    // The actions menu (and therefore the delete trigger) is only relevant
    // for the contract guard. We assert the form still mounts and the
    // sections render.
    expect(() =>
      render(
        <I18nProvider initialLocale="en">
          <EditServiceForm
            service={baseService}
            canUpdateService={false}
            canDeleteService={true}
          />
        </I18nProvider>,
      ),
    ).not.toThrow();
    expect(screen.getByTestId("general-info-section")).toBeInTheDocument();
  });
});

// ===========================================================================
// 3. CreateCategoryModal — props: isOpen, onClose, establishmentId
// ===========================================================================

describe("API contract — CreateCategoryModal props", () => {
  it("accepts isOpen=true and shows the modal content (title + form)", () => {
    render(
      <I18nProvider initialLocale="en">
        <CreateCategoryModal
          isOpen={true}
          onClose={vi.fn()}
          establishmentId="est-1"
        />
      </I18nProvider>,
    );
    // DialogTitle renders the new-category heading.
    expect(
      screen.getByRole("heading", { name: /new category/i }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/category name/i)).toBeInTheDocument();
  });

  it("accepts onClose as a required prop and invokes it from the cancel button", async () => {
    const onClose = vi.fn();
    render(
      <I18nProvider initialLocale="en">
        <CreateCategoryModal
          isOpen={true}
          onClose={onClose}
          establishmentId="est-1"
        />
      </I18nProvider>,
    );

    const cancel = screen.getByRole("button", { name: /^cancel$/i });
    await userEvent.setup().click(cancel);
    expect(onClose).toHaveBeenCalled();
  });

  it("accepts establishmentId as an optional prop and renders it as a hidden input", () => {
    render(
      <I18nProvider initialLocale="en">
        <CreateCategoryModal
          isOpen={true}
          onClose={vi.fn()}
          establishmentId="est-42"
        />
      </I18nProvider>,
    );
    const hidden = document.querySelector(
      'input[type="hidden"][name="establishmentId"]',
    ) as HTMLInputElement | null;
    expect(hidden).not.toBeNull();
    expect(hidden!.value).toBe("est-42");
  });

  it("renders the hidden input with an empty value when establishmentId is omitted", () => {
    render(
      <I18nProvider initialLocale="en">
        <CreateCategoryModal isOpen={true} onClose={vi.fn()} />
      </I18nProvider>,
    );
    const hidden = document.querySelector(
      'input[type="hidden"][name="establishmentId"]',
    ) as HTMLInputElement | null;
    expect(hidden).not.toBeNull();
    expect(hidden!.value).toBe("");
  });
});