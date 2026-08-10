"use client";

import * as React from "react";
import { X, Save } from "lucide-react";
import { ErrorAlert } from "@/contexts/shared/interfaces/components/error";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogClose } from "@/contexts/shared/interfaces/components/ui/dialog";
import { CustomerResponse } from "@/contexts/crm/domain/model/entities/customer";
import { updateCustomerAction } from "@/contexts/crm/interfaces/actions/update-customer.action";
import { CustomerForm, CustomerFormData } from "@/contexts/crm/interfaces/components/customer-management/customer-form";
import { toUpdateCustomerCommand } from "@/contexts/crm/application/transforms/customer-command.transforms";

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

    const command = toUpdateCustomerCommand(data, customer.id);

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
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl">
          <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
            <div>
              <DialogTitle className="text-lg font-semibold text-foreground">Edit Customer Details</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Modify the profile details of the customer in the catalog.
              </DialogDescription>
            </div>
            <DialogClose className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none disabled:pointer-events-none cursor-pointer">
              <X className="h-4 w-4" />
            </DialogClose>
          </div>

          <CustomerForm
            key={customer.id} // Re-mount form when customer changes
            initialData={initialData}
            onSubmit={handleSubmit}
            onCancel={() => onOpenChange(false)}
            isSaving={isSaving}
            submitLabel="Save Changes"
            submitIcon={<Save className="mr-2 h-4 w-4" />}
            establishmentId={customer.establishmentId}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
