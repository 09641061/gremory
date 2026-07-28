"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/contexts/shared/interfaces/components/ui/button";
import { Input } from "@/contexts/shared/interfaces/components/ui/input";
import { Label } from "@/contexts/shared/interfaces/components/ui/label";
import { PhoneInput } from "./phone-input";
import { resolveDocumentAction } from "../actions/resolve-document.action";

export interface CustomerFormData {
  docType: string;
  docNumber: string;
  name: string;
  email: string;
  phonePrefix: string;
  phoneNumber: string;
}

interface CustomerFormProps {
  initialData?: Partial<CustomerFormData>;
  onSubmit: (data: CustomerFormData) => void;
  onCancel?: () => void;
  isSaving: boolean;
  submitLabel: string;
  submitIcon?: React.ReactNode;
}

export function CustomerForm({
  initialData,
  onSubmit,
  onCancel,
  isSaving,
  submitLabel,
  submitIcon,
}: CustomerFormProps) {
  const [docType, setDocType] = React.useState(initialData?.docType || "dni");
  const [docNumber, setDocNumber] = React.useState(initialData?.docNumber || "");
  const [name, setName] = React.useState(initialData?.name || "");
  const [email, setEmail] = React.useState(initialData?.email || "");
  const [phonePrefix, setPhonePrefix] = React.useState(initialData?.phonePrefix || "+51");
  const [phoneNumber, setPhoneNumber] = React.useState(initialData?.phoneNumber || "");

  const [isResolving, setIsResolving] = React.useState(false);
  const prevResolvedRef = React.useRef<string>("");

  const handleResolve = React.useCallback(async () => {
    if (docType !== "dni" && docType !== "ruc") return;
    if (!docNumber) return;

    setIsResolving(true);
    try {
      const res = await resolveDocumentAction(docType as "dni" | "ruc", docNumber);
      if (res.status === "success" && res.data) {
        setName(res.data.name);
      }
    } catch {
      // Silent error for auto-resolve, user can still manually edit
    } finally {
      setIsResolving(false);
    }
  }, [docNumber, docType]);

  // Auto-resolve on length match
  React.useEffect(() => {
    const targetLength = docType === "dni" ? 8 : docType === "ruc" ? 11 : 0;
    const currentIdentity = `${docType}:${docNumber}`;

    if (
      targetLength > 0 &&
      docNumber.length === targetLength &&
      currentIdentity !== prevResolvedRef.current
    ) {
      prevResolvedRef.current = currentIdentity;
      const timeoutId = setTimeout(() => {
        handleResolve();
      }, 0);
      return () => clearTimeout(timeoutId);
    }
  }, [docNumber, docType, handleResolve]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      docType,
      docNumber,
      name,
      email,
      phonePrefix,
      phoneNumber,
    });
  };

  const isDniOrRuc = docType === "dni" || docType === "ruc";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Identity Section */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="doc_type">Document Type</Label>
            <select
              id="doc_type"
              value={docType}
              onChange={(e) => {
                setDocType(e.target.value);
                if (initialData?.docType !== e.target.value) {
                    setName("");
                    setDocNumber("");
                }
              }}
              className="w-full h-9 rounded-lg border border-border bg-transparent px-3 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <option value="dni">DNI (National ID)</option>
              <option value="ruc">RUC (Corporate Tax ID)</option>
              <option value="foreign_resident_card">C.E. (Foreigner ID)</option>
              <option value="passport">Passport</option>
            </select>
          </div>

          <div className="md:col-span-2 space-y-1.5">
            <Label htmlFor="doc_number">Document Number</Label>
            <div className="flex gap-2">
              <Input
                id="doc_number"
                value={docNumber}
                onChange={(e) => setDocNumber(e.target.value)}
                placeholder="Enter number..."
                required
              />
              {isDniOrRuc && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleResolve}
                  disabled={isResolving || !docNumber}
                >
                  {isResolving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify"}
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="full_name">Full Name / Business Name</Label>
          <Input
            id="full_name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={isDniOrRuc ? "Awaiting document entry..." : "Enter full name"}
            required
            disabled={isDniOrRuc && name !== ""}
          />
        </div>
      </div>

      {/* Contact Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="customer@example.com"
            required
          />
        </div>

        <PhoneInput
          id="phone"
          value={phoneNumber}
          prefix={phonePrefix}
          onChange={setPhoneNumber}
          onPrefixChange={setPhonePrefix}
          required
        />
      </div>

      {/* Footer Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isSaving}>
          {isSaving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            submitIcon
          )}
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
