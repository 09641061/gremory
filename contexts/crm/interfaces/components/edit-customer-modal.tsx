"use client";

import * as React from "react";
import { Dialog } from "@base-ui/react/dialog";
import { X, Save } from "lucide-react";
import { Button } from "@/contexts/shared/interfaces/components/ui/button";
import { ErrorAlert } from "@/contexts/shared/interfaces/components/ui/error";
import { CustomerResponse } from "../../domain/model/entities/customer";
import { updateCustomerAction } from "../actions/update-customer.action";
import { CustomerForm, CustomerFormData } from "./customer-form";

interface EditCustomerModalProps {
  customer: CustomerResponse;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (updatedCustomer: CustomerResponse) => void;
}

export function EditCustomerModal({
  customer,
  open,
  onOpenChange,
  onSuccess,
}: EditCustomerModalProps) {
  const [isSaving, setIsSaving] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  const handleSubmit = async (data: CustomerFormData) => {
    setIsSaving(true);
    setErrorMsg(null);

    const command = {
      id: customer.id,
      dni: data.docType === "dni" ? data.docNumber : null,
      ruc: data.docType === "ruc" ? data.docNumber : null,
      foreignResidentCard: data.docType === "foreign_resident_card" ? data.docNumber : null,
      passport: data.docType === "passport" ? data.docNumber : null,
      name: data.name,
      phone: data.phonePrefix + data.phoneNumber,
      email: data.email,
    };

    try {
      const result = await updateCustomerAction(command, customer.establishmentId);
      if (result.status === "success" && result.data) {
        onSuccess(result.data);
        onOpenChange(false);
      } else {
        setErrorMsg(result.error || "Failed to update customer.");
      }
    } catch {
      setErrorMsg("An unexpected error occurred while saving.");
    } finally {
      setIsSaving(false);
    }
  };

  const isPeru = customer.phone.startsWith("+51");
  const initialData: CustomerFormData = {
    docType: customer.documentType.toLowerCase(),
    docNumber: customer.documentNumber,
    name: customer.name,
    email: customer.email,
    phonePrefix: isPeru ? "+51" : customer.phone.startsWith("+") ? "+" : "+51",
    phoneNumber: isPeru ? customer.phone.slice(3) : customer.phone.startsWith("+") ? customer.phone.slice(1) : customer.phone,
  };

  return (
    <>
      <ErrorAlert title="Error updating customer" message={errorMsg ?? undefined} />
      <Dialog.Root open={open} onOpenChange={onOpenChange}>
        <Dialog.Portal>
          <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/50 transition-opacity" />
          <Dialog.Viewport className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <Dialog.Popup className="w-full max-w-4xl rounded-xl border border-border bg-card p-6 text-card-foreground shadow-xl outline-none">
              <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
                <div>
                  <Dialog.Title className="text-lg font-semibold text-primary">Edit Customer Details</Dialog.Title>
                  <Dialog.Description className="text-xs text-muted-foreground">
                    Modify the profile details of the customer in the catalog.
                  </Dialog.Description>
                </div>
                <Dialog.Close className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none disabled:pointer-events-none">
                  <X className="h-4 w-4" />
                </Dialog.Close>
              </div>

              <CustomerForm
                key={customer.id} // Re-mount form when customer changes
                initialData={initialData}
                onSubmit={handleSubmit}
                onCancel={() => onOpenChange(false)}
                isSaving={isSaving}
                submitLabel="Save Changes"
                submitIcon={<Save className="mr-2 h-4 w-4" />}
              />
            </Dialog.Popup>
          </Dialog.Viewport>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
