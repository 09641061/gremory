"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";

import { resolveDocumentAction } from "@/contexts/crm/interfaces/actions/resolve-document.action";
import { FormField } from "@/contexts/shared/interfaces/components/form/form-field";
import { FormSection } from "@/contexts/shared/interfaces/components/form/form-section";
import { FormSubmitButton } from "@/contexts/shared/interfaces/components/form/form-submit-button";
import { useFormSubmit } from "@/contexts/shared/interfaces/components/form/use-form-submit";
import { useFormValidation } from "@/contexts/shared/interfaces/components/form/use-form-validation";
import {
  validateDNI,
  validateForeignResidentCard,
  validatePassport,
  validatePhone,
  validateRUC,
} from "@/contexts/shared/interfaces/components/form/document-validators";
import { Alert, AlertDescription, AlertTitle } from "@/contexts/shared/interfaces/components/ui/alert";
import { Button } from "@/contexts/shared/interfaces/components/ui/button";
import { Input } from "@/contexts/shared/interfaces/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/contexts/shared/interfaces/components/ui/native-select";

import { PhoneInput } from "./phone-input";
import { useCrmTranslations } from "@/contexts/crm/interfaces/i18n";

export interface CustomerFormData {
  docType: string;
  docNumber: string;
  name: string;
  email: string;
  phoneCountryCode: string;
  phoneNumber: string;
}

interface CustomerFormProps {
  initialData?: Partial<CustomerFormData>;
  onSubmit: (data: CustomerFormData) => void;
  onCancel?: () => void;
  isSaving: boolean;
  submitLabel: string;
  submitIcon?: React.ReactNode;
  establishmentId: string;
}

// Synthetic key for the single top-of-form error stored in `useFormValidation`.
const FORM_ERROR_FIELD = "_form";

export function CustomerForm({
  initialData,
  onSubmit,
  onCancel,
  isSaving,
  submitLabel,
  submitIcon,
  establishmentId,
}: CustomerFormProps) {
  const t = useCrmTranslations();
  const [docType, setDocType] = React.useState(initialData?.docType || "dni");
  const [docNumber, setDocNumber] = React.useState(initialData?.docNumber || "");
  const [name, setName] = React.useState(initialData?.name || "");
  const [email, setEmail] = React.useState(initialData?.email || "");
  const [phoneCountryCode, setPhoneCountryCode] = React.useState(initialData?.phoneCountryCode || "+51");
  const [phoneNumber, setPhoneNumber] = React.useState(initialData?.phoneNumber || "");
  const { errors, setError, clearError } = useFormValidation();
  const error = errors[FORM_ERROR_FIELD] ?? null;
  const [isResolving, setIsResolving] = React.useState(false);
  const identityLookupFailedMessage = t.form.errors.identityLookupFailed;
  // `useFormSubmit` centralises the double-submit guard: `guard()` is the
  // synchronous check used at the top of `handleSubmit` so a stale click
  // that races React's commit of `isSaving` still early-returns, and
  // `submit()` wraps the actual `onSubmit(data)` call so re-entry during
  // the parent's async work is blocked. `isSubmitting` feeds the submit
  // button's loading state as a defense-in-depth alongside `isSaving`.
  const { isSubmitting, submit, guard } = useFormSubmit();

  const handleResolve = React.useCallback(async () => {
    if (docType !== "dni" && docType !== "ruc") return;
    if (!docNumber) return;

    setIsResolving(true);
    clearError(FORM_ERROR_FIELD);
    try {
      const res = await resolveDocumentAction(docType as "dni" | "ruc", docNumber, establishmentId);
      if (res.status === "success" && res.data) {
        setName(res.data.name);
      } else if (res.status === "error") {
        setError(FORM_ERROR_FIELD, res.error ?? identityLookupFailedMessage);
      }
    } catch {
      setError(FORM_ERROR_FIELD, identityLookupFailedMessage);
    } finally {
      setIsResolving(false);
    }
  }, [clearError, docNumber, docType, establishmentId, identityLookupFailedMessage, setError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // `isSaving` reflects the parent's lifecycle (EditCustomerForm flips
    // it via setIsSaving). `guard()` reflects this hook's own re-entry
    // lock — together they cover both the "parent already saving" and
    // the "two clicks inside the same render tick" cases.
    if (isSaving || guard()) return;
    clearError(FORM_ERROR_FIELD);

    if (docType === "dni" && !validateDNI(docNumber)) {
      setError(FORM_ERROR_FIELD, t.form.validation.dniLength);
      return;
    }
    if (docType === "ruc" && !validateRUC(docNumber)) {
      setError(FORM_ERROR_FIELD, t.form.validation.rucLength);
      return;
    }
    if (docType === "foreign_resident_card" && !validateForeignResidentCard(docNumber)) {
      setError(FORM_ERROR_FIELD, t.form.validation.foreignCardLength);
      return;
    }
    if (docType === "passport" && !validatePassport(docNumber)) {
      setError(FORM_ERROR_FIELD, t.form.validation.passportLength);
      return;
    }
    if (!validatePhone(phoneCountryCode, phoneNumber)) {
      setError(FORM_ERROR_FIELD, t.form.validation.phoneFormat);
      return;
    }

    // Wrap the parent's onSubmit in `submit()` so the hook's in-flight
    // flag covers the full submission lifecycle. `onSubmit` is typed as
    // `void` but may be backed by an async handler that returns a
    // Promise; awaiting it inside the callback is what actually keeps
    // the hook's lock held for the duration of the parent's work. A
    // purely-sync `onSubmit` (returning `undefined`) resolves on the next
    // microtask, so the lock is still held across React's commit window —
    // enough to absorb a same-tick double-click.
    await submit(async () => {
      await onSubmit({
        docType,
        docNumber,
        name,
        email,
        phoneCountryCode: phoneCountryCode.trim(),
        phoneNumber,
      });
    });
  };

  const isDniOrRuc = docType === "dni" || docType === "ruc";

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      {error ? (
        <Alert variant="destructive">
          <AlertTitle>{t.form.validation.errorTitle}</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <FormSection title={t.form.identitySection} description={t.form.identitySubtitle}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <FormField id="doc_type" label={t.form.documentTypeLabel}>
            <NativeSelect
              id="doc_type"
              className="w-full"
              value={docType}
              onChange={(e) => {
                setDocType(e.target.value);
                setName("");
                setDocNumber("");
                clearError(FORM_ERROR_FIELD);
              }}
            >
              <NativeSelectOption value="dni">{t.form.docTypes.dni}</NativeSelectOption>
              <NativeSelectOption value="ruc">{t.form.docTypes.ruc}</NativeSelectOption>
              <NativeSelectOption value="foreign_resident_card">{t.form.docTypes.foreign_resident_card}</NativeSelectOption>
              <NativeSelectOption value="passport">{t.form.docTypes.passport}</NativeSelectOption>
            </NativeSelect>
          </FormField>

          {/* doc_number: autofill Button is FormField's `trailingAdornment`. For non-DNI/RUC doc types the adornment is null and FormField drops the flex wrapper. */}
          <FormField
            id="doc_number"
            label={t.form.documentNumberLabel}
            className="md:col-span-2"
            trailingAdornment={isDniOrRuc ? (
              <Button type="button" variant="outline" onClick={handleResolve} disabled={isResolving || !docNumber}>
                {isResolving ? <Loader2 className="size-4 animate-spin" /> : t.form.autoFill}
              </Button>
            ) : null}
          >
            <Input
              id="doc_number"
              value={docNumber}
              onChange={(e) => {
                const val = e.target.value;
                clearError(FORM_ERROR_FIELD);
                const pattern = docType === "passport" ? /^[A-Za-z0-9]*$/ : /^\d*$/;
                if (pattern.test(val)) {
                  setDocNumber(docType === "passport" ? val.toUpperCase() : val);
                }
              }}
              placeholder={t.form.documentNumberPlaceholder}
              required
            />
          </FormField>

          <FormField id="full_name" label={t.form.nameLabel} className="md:col-span-3">
            <Input
              id="full_name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t.form.namePlaceholder}
              required
            />
          </FormField>
        </div>
      </FormSection>

      <FormSection title={t.form.contactSection} description={t.form.contactSubtitle}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField id="email" label={t.form.emailLabel}>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t.form.emailPlaceholder}
              required
            />
          </FormField>
          {/* PhoneInput owns its Label + two Inputs; cannot be a single FormField child. */}
          <PhoneInput
            id="phone"
            value={phoneNumber}
            countryCode={phoneCountryCode}
            onChange={setPhoneNumber}
            onCountryCodeChange={setPhoneCountryCode}
            required
          />
        </div>
      </FormSection>

      <div className="flex justify-end gap-3 border-t border-border/70 pt-4">
        {onCancel ? (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSaving || isSubmitting}>
            {t.form.cancel}
          </Button>
        ) : null}
        <FormSubmitButton isSubmitting={isSaving || isSubmitting} icon={submitIcon}>
          {submitLabel}
        </FormSubmitButton>
      </div>
    </form>
  );
}