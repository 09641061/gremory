"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";

import { toUpdateCustomerCommand } from "@/contexts/crm/application/transforms/customer-command.transforms";
import { updateCustomerAction } from "@/contexts/crm/interfaces/actions/update-customer.action";
import type { CustomerResponse } from "@/contexts/crm/domain/model/entities/customer";
import { ErrorAlert } from "@/contexts/shared/interfaces/components/error";
import { PageHeader, PageShell } from "@/contexts/shared/interfaces/components/page-shell";
import { Card, CardContent } from "@/contexts/shared/interfaces/components/ui/card";

import { CustomerForm, type CustomerFormData } from "./customer-form";

interface EditCustomerFormProps {
  customer: CustomerResponse;
}

export function EditCustomerForm({ customer }: EditCustomerFormProps) {
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
        setErrorMsg(result.error || "Failed to update customer.");
      }
    } catch {
      setErrorMsg("An unexpected error occurred while saving the customer.");
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
      <ErrorAlert title="Error updating customer" message={errorMsg ?? undefined} />
      <PageShell>
        <PageHeader
          title="Edit customer"
          description="Update the customer profile in the directory."
        />

        <Card className="max-w-4xl">
          <CardContent className="p-6">
            <CustomerForm
              key={customer.id}
              initialData={initialData}
              onSubmit={handleSubmit}
              isSaving={isSaving || isPending}
              submitLabel="Save changes"
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
