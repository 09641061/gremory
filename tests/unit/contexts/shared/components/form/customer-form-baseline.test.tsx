/** @vitest-environment jsdom */
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { I18nProvider } from "@/contexts/shared/interfaces/i18n";
import { CustomerForm } from "@/contexts/crm/interfaces/components/customer-management/customer-form";

// Server action — the form calls it for DNI/RUC autofill. We mock it to keep
// the test pure (no Next.js runtime, no auth/workspace queries).
vi.mock("@/contexts/crm/interfaces/actions/resolve-document.action", () => ({
  resolveDocumentAction: vi.fn(),
}));

// next/navigation is referenced transitively by other modules in the form
// tree (e.g. I18nProvider). A router stub is the safe default.
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

type FormOverrides = Partial<Omit<typeof baseProps, "onSubmit">> & {
  onSubmit?: ReturnType<typeof vi.fn>;
  initialData?: Parameters<typeof CustomerForm>[0]["initialData"];
};

function renderForm(overrides: FormOverrides = {}) {
  const onSubmit = overrides.onSubmit ?? vi.fn();
  const { initialData, ...rest } = overrides;
  const utils = render(
    <I18nProvider initialLocale="en">
      <CustomerForm
        {...baseProps}
        {...rest}
        {...(initialData ? { initialData } : {})}
        onSubmit={onSubmit}
      />
    </I18nProvider>,
  );
  return { ...utils, onSubmit };
}

/**
 * Fill the form with valid data for the current docType. The country code
 * field is intentionally left alone because its default value ("+51") is
 * already valid; typing more chars would make it invalid.
 */
async function fillValidForm(
  user: ReturnType<typeof userEvent.setup>,
  opts: { docNumber: string; name: string; phone?: string } = {
    docNumber: "12345678",
    name: "Maria Gonzalez",
    phone: "987654321",
  },
) {
  const phone = opts.phone ?? "987654321";
  await user.clear(screen.getByLabelText(/document number/i));
  await user.type(screen.getByLabelText(/document number/i), opts.docNumber);
  await user.type(screen.getByLabelText(/full name/i), opts.name);
  await user.type(screen.getByLabelText(/email address/i), "m@example.com");
  await user.clear(screen.getByRole("textbox", { name: /phone number/i }));
  await user.type(
    screen.getByRole("textbox", { name: /phone number/i }),
    phone,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  mockResolveDocumentAction.mockResolvedValue({
    status: "error",
    data: null,
    error: null,
    errorId: null,
    fieldErrors: null,
  });
});

// ---------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------

describe("CustomerForm — initial render", () => {
  it("renders with default empty fields and the four document types", () => {
    renderForm();

    expect(screen.getByLabelText(/full name/i)).toHaveValue("");
    expect(screen.getByLabelText(/email address/i)).toHaveValue("");
    expect(screen.getByRole("textbox", { name: /country code/i })).toHaveValue("+51");
    expect(screen.getByRole("textbox", { name: /phone number/i })).toHaveValue("");

    const docType = screen.getByLabelText(/document type/i) as HTMLSelectElement;
    expect(docType.value).toBe("dni");
    expect(within(docType).getByRole("option", { name: /dni/i })).toBeInTheDocument();
    expect(within(docType).getByRole("option", { name: /ruc/i })).toBeInTheDocument();
    expect(within(docType).getByRole("option", { name: /foreign resident card/i })).toBeInTheDocument();
    expect(within(docType).getByRole("option", { name: /passport/i })).toBeInTheDocument();
  });

  it("hydrates every field from initialData", () => {
    renderForm({
      initialData: {
        docType: "ruc",
        docNumber: "20123456789",
        name: "Maria Gonzalez",
        email: "maria@example.com",
        phoneCountryCode: "+51",
        phoneNumber: "987654321",
      },
    });

    expect((screen.getByLabelText(/document type/i) as HTMLSelectElement).value).toBe("ruc");
    expect(screen.getByLabelText(/document number/i)).toHaveValue("20123456789");
    expect(screen.getByLabelText(/full name/i)).toHaveValue("Maria Gonzalez");
    expect(screen.getByLabelText(/email address/i)).toHaveValue("maria@example.com");
    expect(screen.getByRole("textbox", { name: /country code/i })).toHaveValue("+51");
    expect(screen.getByRole("textbox", { name: /phone number/i })).toHaveValue("987654321");
  });

  it("shows the autofill button for DNI and RUC and hides it for the other types", () => {
    // Each scenario renders a fresh form because CustomerForm's useState
    // initializers only run on mount; a `rerender` with new initialData would
    // keep the previous state and silently invalidate this assertion. We
    // `unmount()` between scenarios so the previous form's autofill button
    // does not leak into the DOM of the next render.
    const dni = renderForm({ initialData: { docType: "dni" } });
    expect(screen.getByRole("button", { name: /autofill/i })).toBeInTheDocument();
    dni.unmount();

    const ruc = renderForm({ initialData: { docType: "ruc" } });
    expect(screen.getByRole("button", { name: /autofill/i })).toBeInTheDocument();
    ruc.unmount();

    const passport = renderForm({ initialData: { docType: "passport" } });
    expect(screen.queryByRole("button", { name: /autofill/i })).not.toBeInTheDocument();
    passport.unmount();

    renderForm({ initialData: { docType: "foreign_resident_card" } });
    expect(screen.queryByRole("button", { name: /autofill/i })).not.toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Per-document-type validation
// ---------------------------------------------------------------------------

describe("CustomerForm — per-document-type validation", () => {
  it("accepts a valid DNI (8 digits)", async () => {
    const { onSubmit } = renderForm({ initialData: { docType: "dni" } });
    const user = userEvent.setup();
    await fillValidForm(user, { docNumber: "12345678", name: "Maria" });
    await user.click(screen.getByRole("button", { name: /save customer/i }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(onSubmit.mock.calls[0]?.[0].docType).toBe("dni");
    expect(onSubmit.mock.calls[0]?.[0].docNumber).toBe("12345678");
  });

  it("rejects a DNI with fewer than 8 digits", async () => {
    const { onSubmit } = renderForm({ initialData: { docType: "dni" } });
    const user = userEvent.setup();
    await fillValidForm(user, { docNumber: "1234567", name: "Maria" });
    await user.click(screen.getByRole("button", { name: /save customer/i }));
    expect(onSubmit).not.toHaveBeenCalled();
    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(/dni/i);
  });

  it("rejects a DNI with more than 8 digits", async () => {
    const { onSubmit } = renderForm({ initialData: { docType: "dni" } });
    const user = userEvent.setup();
    await fillValidForm(user, { docNumber: "123456789", name: "Maria" });
    await user.click(screen.getByRole("button", { name: /save customer/i }));
    expect(onSubmit).not.toHaveBeenCalled();
    expect(await screen.findByRole("alert")).toHaveTextContent(/dni/i);
  });

  it("accepts a valid RUC (11 digits)", async () => {
    const { onSubmit } = renderForm({ initialData: { docType: "ruc" } });
    const user = userEvent.setup();
    await fillValidForm(user, { docNumber: "20123456789", name: "Empresa" });
    await user.click(screen.getByRole("button", { name: /save customer/i }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(onSubmit.mock.calls[0]?.[0].docType).toBe("ruc");
  });

  it("rejects a RUC with 10 digits", async () => {
    const { onSubmit } = renderForm({ initialData: { docType: "ruc" } });
    const user = userEvent.setup();
    await fillValidForm(user, { docNumber: "2012345678", name: "Empresa" });
    await user.click(screen.getByRole("button", { name: /save customer/i }));
    expect(onSubmit).not.toHaveBeenCalled();
    expect(await screen.findByRole("alert")).toHaveTextContent(/ruc/i);
  });

  it("rejects a RUC with 12 digits", async () => {
    const { onSubmit } = renderForm({ initialData: { docType: "ruc" } });
    const user = userEvent.setup();
    await fillValidForm(user, { docNumber: "201234567890", name: "Empresa" });
    await user.click(screen.getByRole("button", { name: /save customer/i }));
    expect(onSubmit).not.toHaveBeenCalled();
    expect(await screen.findByRole("alert")).toHaveTextContent(/ruc/i);
  });

  it("accepts a Foreign Resident Card with 9 digits", async () => {
    const { onSubmit } = renderForm({ initialData: { docType: "foreign_resident_card" } });
    const user = userEvent.setup();
    await fillValidForm(user, { docNumber: "123456789", name: "Foreigner" });
    await user.click(screen.getByRole("button", { name: /save customer/i }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
  });

  it("rejects a Foreign Resident Card with 8 digits", async () => {
    const { onSubmit } = renderForm({ initialData: { docType: "foreign_resident_card" } });
    const user = userEvent.setup();
    await fillValidForm(user, { docNumber: "12345678", name: "Foreigner" });
    await user.click(screen.getByRole("button", { name: /save customer/i }));
    expect(onSubmit).not.toHaveBeenCalled();
    expect(await screen.findByRole("alert")).toHaveTextContent(/foreign resident card/i);
  });

  it("rejects a Foreign Resident Card with 12 digits", async () => {
    const { onSubmit } = renderForm({ initialData: { docType: "foreign_resident_card" } });
    const user = userEvent.setup();
    await fillValidForm(user, { docNumber: "123456789012", name: "Foreigner" });
    await user.click(screen.getByRole("button", { name: /save customer/i }));
    expect(onSubmit).not.toHaveBeenCalled();
    expect(await screen.findByRole("alert")).toHaveTextContent(/foreign resident card/i);
  });

  it("accepts a 6-character passport", async () => {
    const { onSubmit } = renderForm({ initialData: { docType: "passport" } });
    const user = userEvent.setup();
    await fillValidForm(user, { docNumber: "ABCDEF", name: "Traveler" });
    await user.click(screen.getByRole("button", { name: /save customer/i }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
  });

  it("rejects a 5-character passport (below minimum)", async () => {
    const { onSubmit } = renderForm({ initialData: { docType: "passport" } });
    const user = userEvent.setup();
    await fillValidForm(user, { docNumber: "ABCDE", name: "Traveler" });
    await user.click(screen.getByRole("button", { name: /save customer/i }));
    expect(onSubmit).not.toHaveBeenCalled();
    expect(await screen.findByRole("alert")).toHaveTextContent(/passport/i);
  });

  it("uppercases passport input automatically", async () => {
    renderForm({ initialData: { docType: "passport" } });
    const user = userEvent.setup();
    await user.clear(screen.getByLabelText(/document number/i));
    await user.type(screen.getByLabelText(/document number/i), "abcdef");
    expect(screen.getByLabelText(/document number/i)).toHaveValue("ABCDEF");
  });

  it("filters non-alphanumeric characters out of the passport input", async () => {
    renderForm({ initialData: { docType: "passport" } });
    const user = userEvent.setup();
    await user.clear(screen.getByLabelText(/document number/i));
    await user.type(screen.getByLabelText(/document number/i), "ABC-123");
    // The hyphen must be dropped; "ABC" + "123" → "ABC123" is 6 chars and valid.
    expect(screen.getByLabelText(/document number/i)).toHaveValue("ABC123");
  });

  it("filters non-digits out of the DNI input", async () => {
    renderForm({ initialData: { docType: "dni" } });
    const user = userEvent.setup();
    await user.clear(screen.getByLabelText(/document number/i));
    await user.type(screen.getByLabelText(/document number/i), "1a2b3c4d5e6f7g8");
    expect(screen.getByLabelText(/document number/i)).toHaveValue("12345678");
  });
});

// ---------------------------------------------------------------------------
// Inline error display
// ---------------------------------------------------------------------------

describe("CustomerForm — inline error display", () => {
  it("shows the validation error in a destructive Alert when document number is wrong", async () => {
    renderForm({ initialData: { docType: "dni" } });
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/document number/i), "123");
    await user.click(screen.getByRole("button", { name: /save customer/i }));

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(/validation error/i);
    expect(alert).toHaveTextContent(/dni/i);
    expect(alert).toHaveTextContent(/8 digits/i);
  });

  it("clears the previous error when the user edits the document number", async () => {
    renderForm({ initialData: { docType: "dni" } });
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/document number/i), "123");
    await user.click(screen.getByRole("button", { name: /save customer/i }));

    const alert = await screen.findByRole("alert");
    expect(alert).toBeInTheDocument();

    await user.type(screen.getByLabelText(/document number/i), "4");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("shows a phone format error when the country code is invalid", async () => {
    const { onSubmit } = renderForm({ initialData: { docType: "dni" } });
    const user = userEvent.setup();
    await fillValidForm(user, { docNumber: "12345678", name: "Maria", phone: undefined });

    // Type an invalid country code: replace the default "+51" entirely.
    await user.clear(screen.getByRole("textbox", { name: /country code/i }));
    await user.type(screen.getByRole("textbox", { name: /country code/i }), "abc");
    await user.click(screen.getByRole("button", { name: /save customer/i }));

    expect(onSubmit).not.toHaveBeenCalled();
    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(/country code/i);
  });
});

// ---------------------------------------------------------------------------
// Successful submit
// ---------------------------------------------------------------------------

describe("CustomerForm — successful submit", () => {
  it("calls onSubmit with the correct payload when all fields are valid", async () => {
    const onSubmit = vi.fn();
    renderForm({ onSubmit });
    const user = userEvent.setup();

    await fillValidForm(user, { docNumber: "12345678", name: "Maria Gonzalez" });

    await user.click(screen.getByRole("button", { name: /save customer/i }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit).toHaveBeenCalledWith({
      docType: "dni",
      docNumber: "12345678",
      name: "Maria Gonzalez",
      email: "m@example.com",
      phoneCountryCode: "+51",
      phoneNumber: "987654321",
    });
  });

  it("calls onSubmit exactly once when the user double-clicks the submit button", async () => {
    // The hook's `useFormSubmit` lock stays held for the duration of the
    // callback's resolution. A parent that returns a never-resolving
    // Promise models a real "save in flight" — the second click has to
    // be blocked by the hook's re-entry guard, not by an external
    // `isSaving` prop (the test explicitly sets `isSaving: false`).
    const onSubmit = vi.fn().mockReturnValue(new Promise(() => {}));
    renderForm({ onSubmit });
    const user = userEvent.setup();
    await fillValidForm(user);

    const submit = screen.getByRole("button", { name: /save customer/i });
    await user.click(submit);
    await user.click(submit);
    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });
});

// ---------------------------------------------------------------------------
// Switching document type clears sensitive fields
// ---------------------------------------------------------------------------

describe("CustomerForm — switching document type clears fields", () => {
  it("clears name and document number when the document type changes", async () => {
    renderForm({
      initialData: {
        docType: "dni",
        docNumber: "12345678",
        name: "Maria",
      },
    });
    const user = userEvent.setup();

    expect(screen.getByLabelText(/document number/i)).toHaveValue("12345678");
    expect(screen.getByLabelText(/full name/i)).toHaveValue("Maria");

    await user.selectOptions(screen.getByLabelText(/document type/i), "passport");

    expect(screen.getByLabelText(/document number/i)).toHaveValue("");
    expect(screen.getByLabelText(/full name/i)).toHaveValue("");
  });

  it("does not clear the email or phone fields when the document type changes", async () => {
    renderForm({
      initialData: {
        docType: "dni",
        docNumber: "12345678",
        name: "Maria",
        email: "maria@example.com",
        phoneCountryCode: "+51",
        phoneNumber: "987654321",
      },
    });
    const user = userEvent.setup();

    await user.selectOptions(screen.getByLabelText(/document type/i), "ruc");

    expect(screen.getByLabelText(/email address/i)).toHaveValue("maria@example.com");
    expect(screen.getByRole("textbox", { name: /country code/i })).toHaveValue("+51");
    expect(screen.getByRole("textbox", { name: /phone number/i })).toHaveValue("987654321");
  });

  it("also clears the inline error when the document type changes", async () => {
    renderForm({ initialData: { docType: "dni" } });
    const user = userEvent.setup();

    // Trigger a validation error
    await user.type(screen.getByLabelText(/document number/i), "123");
    await user.click(screen.getByRole("button", { name: /save customer/i }));
    expect(await screen.findByRole("alert")).toBeInTheDocument();

    // Switching docType must reset the inline error too.
    await user.selectOptions(screen.getByLabelText(/document type/i), "ruc");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Cancel button
// ---------------------------------------------------------------------------

describe("CustomerForm — cancel button", () => {
  it("renders the cancel button when onCancel is provided and triggers it on click", async () => {
    const onCancel = vi.fn();
    renderForm({ onCancel });
    const user = userEvent.setup();

    const cancelButton = screen.getByRole("button", { name: /^cancel$/i });
    await user.click(cancelButton);
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("does not render the cancel button when onCancel is not provided", () => {
    renderForm({ onCancel: undefined });
    expect(screen.queryByRole("button", { name: /^cancel$/i })).not.toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Autofill behavior (calls resolveDocumentAction and patches the name)
// ---------------------------------------------------------------------------

describe("CustomerForm — autofill", () => {
  it("calls resolveDocumentAction with the doc type and number on autofill click", async () => {
    mockResolveDocumentAction.mockResolvedValueOnce({
      status: "error",
      data: null,
      error: null,
      errorId: null,
      fieldErrors: null,
    });

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

  it("patches the name field with the resolved customer data", async () => {
    mockResolveDocumentAction.mockResolvedValueOnce({
      status: "success",
      data: { name: "Resolved Name" },
      error: null,
      errorId: null,
      fieldErrors: null,
    });

    renderForm({ initialData: { docType: "dni" } });
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/document number/i), "12345678");
    await user.click(screen.getByRole("button", { name: /autofill/i }));

    await waitFor(() => {
      expect(screen.getByLabelText(/full name/i)).toHaveValue("Resolved Name");
    });
  });

  it("does not throw when resolveDocumentAction rejects", async () => {
    mockResolveDocumentAction.mockRejectedValueOnce(new Error("network"));

    renderForm({ initialData: { docType: "dni" } });
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/document number/i), "12345678");
    await expect(
      user.click(screen.getByRole("button", { name: /autofill/i })),
    ).resolves.not.toThrow();
  });

  it("disables the autofill button when the document number is empty", () => {
    renderForm({ initialData: { docType: "dni" } });
    expect(screen.getByRole("button", { name: /autofill/i })).toBeDisabled();
  });
});