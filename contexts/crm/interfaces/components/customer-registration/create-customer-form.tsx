"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";

import { toCustomerIdentityFields } from "@/contexts/crm/application/transforms/customer-command.transforms";
import { registerCustomerAction } from "@/contexts/crm/interfaces/actions/register-customer.action";
import { ErrorAlert } from "@/contexts/shared/interfaces/components/error";
import { PageHeader, PageShell } from "@/contexts/shared/interfaces/components/page-shell";
import { Card, CardContent } from "@/contexts/shared/interfaces/components/ui/card";

import { CustomerForm, type CustomerFormData } from "../customer-management/customer-form";

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
          router.push(`/crm?establishmentId=${encodeURIComponent(establishmentId)}`);
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
      <PageShell>
        <PageHeader
          title="Add customer"
          description="Create a new customer profile in the directory."
        />

        <Card className="max-w-4xl">
          <CardContent className="p-6">
            <CustomerForm
              onSubmit={handleSubmit}
              isSaving={isWorking}
              submitLabel="Save customer"
              submitIcon={<Save className="size-4" />}
              onCancel={() => router.back()}
              establishmentId={establishmentId}
            />
          </CardContent>
        </Card>
      </PageShell>
    </>
  );
}
