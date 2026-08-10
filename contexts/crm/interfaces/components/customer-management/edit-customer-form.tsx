"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";
import { ErrorAlert } from "@/contexts/shared/interfaces/components/error";
import { updateCustomerAction } from "@/contexts/crm/interfaces/actions/update-customer.action";
import { CustomerForm, CustomerFormData } from "@/contexts/crm/interfaces/components/customer-management/customer-form";
import { toUpdateCustomerCommand } from "@/contexts/crm/application/transforms/customer-command.transforms";
import { CustomerResponse } from "@/contexts/crm/domain/model/entities/customer";

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
          router.push("/crm");
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
      <div className="bg-background text-foreground flex flex-col">
        <main className="flex-1 max-w-[800px] w-full mx-auto px-4 py-8">
          <div className="rounded-lg border border-border bg-card p-6">
            <div className="border-b border-border pb-4">
              <h1 className="text-xl font-bold text-foreground">Edit Customer</h1>
              <p className="text-sm text-muted-foreground mt-1.5">
                Update the customer profile in the administrative catalog.
              </p>
            </div>

            <div className="pt-6">
              <CustomerForm
                key={customer.id}
                initialData={initialData}
                onSubmit={handleSubmit}
                isSaving={isSaving || isPending}
                submitLabel="Save Changes"
                submitIcon={<Save className="size-4" />}
                onCancel={() => router.back()}
                establishmentId={customer.establishmentId}
              />
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
