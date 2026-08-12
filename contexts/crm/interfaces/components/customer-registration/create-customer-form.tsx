"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";
import { ErrorAlert } from "@/contexts/shared/interfaces/components/error";
import { registerCustomerAction } from "@/contexts/crm/interfaces/actions/register-customer.action";
import { CustomerForm, CustomerFormData } from "@/contexts/crm/interfaces/components/customer-management/customer-form";
import { toCustomerIdentityFields } from "@/contexts/crm/application/transforms/customer-command.transforms";

interface CreateCustomerFormProps {
  establishmentId: string;
}

export function CreateCustomerForm({ establishmentId }: CreateCustomerFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();
  const [isSaving, setIsSaving] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  const handleSubmit = async (data: CustomerFormData) => {
    setIsSaving(true);
    setErrorMsg(null);

    const command = toCustomerIdentityFields(data);

    try {
      const result = await registerCustomerAction(command, establishmentId);
      if (result.status === "success") {
        startTransition(() => {
          router.push("/crm");
          router.refresh();
        });
      } else {
        setErrorMsg(result.error || "Failed to register customer.");
      }
    } catch {
      setErrorMsg("An unexpected error occurred while registering the customer.");
    } finally {
      setIsSaving(false);
    }
  };

  const isWorking = isSaving || isPending;

  return (
    <>
      <ErrorAlert title="Error registering customer" message={errorMsg ?? undefined} />
      <div className="bg-background text-foreground flex flex-col">
        <main className="flex-1 max-w-[800px] w-full mx-auto px-4 py-8">
          <div className="rounded-lg border border-border bg-card p-6">
            <div className="border-b border-border pb-4">
              <h1 className="text-xl font-bold text-foreground">Create New Customer</h1>
              <p className="text-sm text-muted-foreground mt-1.5">
                Create a new customer profile in the administrative catalog.
              </p>
            </div>

            <div className="pt-6">
              <CustomerForm
                onSubmit={handleSubmit}
                isSaving={isWorking}
                submitLabel="Save"
                submitIcon={<Save className="size-4" />}
                onCancel={() => router.back()}
                establishmentId={establishmentId}
              />
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
