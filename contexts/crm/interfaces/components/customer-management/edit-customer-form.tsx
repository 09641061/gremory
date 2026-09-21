"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";

import { toUpdateCustomerCommand } from "@/contexts/crm/application/transforms/customer-command.transforms";
import { updateCustomerAction } from "@/contexts/crm/interfaces/actions/update-customer.action";
import type { CustomerResponse } from "@/contexts/crm/domain/model/entities/customer";
import { ErrorAlert } from "@/contexts/shared/interfaces/components/feedback/error";
import { PageHeader, PageShell } from "@/contexts/shared/interfaces/components/layout/page-shell";
import { Card, CardContent } from "@/contexts/shared/interfaces/components/ui/card";

import { CustomerForm, type CustomerFormData } from "./customer-form";
import { useCrmTranslations } from "@/contexts/crm/interfaces/i18n";

interface EditCustomerFormProps {
  customer: CustomerResponse;
}

export function EditCustomerForm({ customer }: EditCustomerFormProps) {
  const t = useCrmTranslations();
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();
  const [isSaving, setIsSaving] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  const handleSubmit = async (data: CustomerFormData) => {
    setIsSaving(true);
    setErrorMsg(null);

    try {
      const result = await updateCustomerAction(toUpdateCustomerCommand(data, customer.id), customer.establishmentId);
      if (result.status === "success") {
        startTransition(() => {
          router.push("/crm?establishmentId=" + encodeURIComponent(customer.establishmentId));
          router.refresh();
        });
      } else {
        setErrorMsg(result.error || t.form.errors.updateFailed);
      }
    } catch {
      setErrorMsg(t.form.errors.unexpectedUpdate);
    } finally {
      setIsSaving(false);
    }
  };

  const legacyPhone = customer.phone ?? "";
  const legacyCountryCode = legacyPhone.startsWith("+51") ? "+51" : "";
  const initialData: CustomerFormData = {
    docType: customer.documentType.toLowerCase(),
    docNumber: customer.documentNumber,
    name: customer.name,
    email: customer.email,
    phoneCountryCode: customer.phoneCountryCode ?? legacyCountryCode,
    phoneNumber: customer.phoneNumber ?? (legacyCountryCode ? legacyPhone.slice(3) : legacyPhone.replace(/^\+/, "")),
  };

  return (
    <>
      <ErrorAlert title={t.form.errors.updateTitle} message={errorMsg ?? undefined} />
      <PageShell>
        <PageHeader
          title={t.form.editCustomerTitle}
          description={t.form.editCustomerDescription}
        />

        <Card className="max-w-4xl">
          <CardContent className="p-6">
            <CustomerForm
              key={customer.id}
              initialData={initialData}
              onSubmit={handleSubmit}
              isSaving={isSaving || isPending}
              submitLabel={t.form.saveChanges}
              submitIcon={<Save className="size-4" />}
              onCancel={() => router.back()}
              establishmentId={customer.establishmentId}
            />
          </CardContent>
        </Card>
      </PageShell>
    </>
  );
}
