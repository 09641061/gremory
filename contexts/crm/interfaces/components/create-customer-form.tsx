"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { Button } from "@/contexts/shared/interfaces/components/ui/button";
import { ErrorAlert } from "@/contexts/shared/interfaces/components/ui/error";
import { registerCustomerAction } from "../actions/register-customer.action";
import { CustomerForm, CustomerFormData } from "./customer-form";

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

    const command = {
      dni: data.docType === "dni" ? data.docNumber : null,
      ruc: data.docType === "ruc" ? data.docNumber : null,
      foreignResidentCard: data.docType === "foreign_resident_card" ? data.docNumber : null,
      passport: data.docType === "passport" ? data.docNumber : null,
      name: data.name,
      phone: data.phonePrefix + data.phoneNumber,
      email: data.email,
    };

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
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
          {/* Form Header */}
          <div className="px-6 py-4 border-b border-border bg-muted/30 flex justify-between items-center">
            <div>
              <h1 className="text-lg font-semibold text-primary">Add New Customer</h1>
              <p className="text-xs text-muted-foreground">Create a new customer profile in the administrative catalog.</p>
            </div>
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="p-6">
            <CustomerForm
              onSubmit={handleSubmit}
              isSaving={isWorking}
              submitLabel="Register Customer"
              onCancel={() => router.back()}
              establishmentId={establishmentId}
            />
          </div>
        </div>
      </main>
    </>
  );
}
