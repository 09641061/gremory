"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";

import { resolveDocumentAction } from "@/contexts/crm/interfaces/actions/resolve-document.action";
import { Alert, AlertDescription, AlertTitle } from "@/contexts/shared/interfaces/components/ui/alert";
import { Button } from "@/contexts/shared/interfaces/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/contexts/shared/interfaces/components/ui/card";
import { Input } from "@/contexts/shared/interfaces/components/ui/input";
import { Label } from "@/contexts/shared/interfaces/components/ui/label";
import { NativeSelect, NativeSelectOption } from "@/contexts/shared/interfaces/components/ui/native-select";

import { PhoneInput } from "./phone-input";

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

export function CustomerForm({
  initialData,
  onSubmit,
  onCancel,
  isSaving,
  submitLabel,
  submitIcon,
  establishmentId,
}: CustomerFormProps) {
  const [docType, setDocType] = React.useState(initialData?.docType || "dni");
  const [docNumber, setDocNumber] = React.useState(initialData?.docNumber || "");
  const [name, setName] = React.useState(initialData?.name || "");
  const [email, setEmail] = React.useState(initialData?.email || "");
  const [phoneCountryCode, setPhoneCountryCode] = React.useState(initialData?.phoneCountryCode || "+51");
  const [phoneNumber, setPhoneNumber] = React.useState(initialData?.phoneNumber || "");
  const [error, setError] = React.useState<string | null>(null);
  const [isResolving, setIsResolving] = React.useState(false);

  const handleResolve = React.useCallback(async () => {
    if (docType !== "dni" && docType !== "ruc") return;
    if (!docNumber) return;

    setIsResolving(true);
    try {
      const res = await resolveDocumentAction(docType as "dni" | "ruc", docNumber, establishmentId);
      if (res.status === "success" && res.data) {
        setName(res.data.name);
      }
    } catch {
      // Silent error, user can still manually edit
    } finally {
      setIsResolving(false);
    }
  }, [docNumber, docType, establishmentId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (docType === "dni") {
      if (!/^\d{8}$/.test(docNumber)) {
        setError("The DNI must have exactly 8 digits.");
        return;
      }
    } else if (docType === "ruc") {
      if (!/^\d{11}$/.test(docNumber)) {
        setError("The RUC must have exactly 11 digits.");
        return;
      }
    } else if (docType === "foreign_resident_card") {
      if (!/^\d{9,11}$/.test(docNumber)) {
        setError("The Foreign Resident Card must have between 9 and 11 digits.");
        return;
      }
    } else if (docType === "passport") {
      if (!/^[A-Z0-9]{6,15}$/.test(docNumber)) {
        setError("The Passport must be 6 to 15 alphanumeric characters.");
        return;
      }
    }

    if (!/^\+?\d+$/.test(phoneCountryCode.trim()) || !/^\d+$/.test(phoneNumber)) {
      setError("The country code must contain only digits and may start with +.");
      return;
    }

    onSubmit({
      docType,
      docNumber,
      name,
      email,
      phoneCountryCode: phoneCountryCode.trim(),
      phoneNumber,
    });
  };

  const isDniOrRuc = docType === "dni" || docType === "ruc";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error ? (
        <Alert variant="destructive">
          <AlertTitle>Validation error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <Card>
        <CardHeader className="border-b border-border/70 pb-4">
          <CardTitle className="text-base">Customer identity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 p-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="doc_type">Document type</Label>
              <NativeSelect
                id="doc_type"
                className="w-full"
                value={docType}
                onChange={(e) => {
                  const newType = e.target.value;
                  setDocType(newType);
                  setName("");
                  setDocNumber("");
                  setError(null);
                }}
              >
                <NativeSelectOption value="dni">DNI (National ID)</NativeSelectOption>
                <NativeSelectOption value="ruc">RUC (Corporate Tax ID)</NativeSelectOption>
                <NativeSelectOption value="foreign_resident_card">Foreign Resident Card</NativeSelectOption>
                <NativeSelectOption value="passport">Passport</NativeSelectOption>
              </NativeSelect>
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <Label htmlFor="doc_number">Document number</Label>
              <div className="flex gap-2">
                <Input
                  id="doc_number"
                  value={docNumber}
                  onChange={(e) => {
                    const val = e.target.value;
                    setError(null);
                    const pattern = docType === "passport" ? /^[A-Za-z0-9]*$/ : /^\d*$/;
                    if (pattern.test(val)) {
                      setDocNumber(docType === "passport" ? val.toUpperCase() : val);
                    }
                  }}
                  maxLength={docType === "dni" ? 8 : docType === "ruc" || docType === "foreign_resident_card" ? 11 : 15}
                  placeholder="Enter number"
                  required
                />
                {isDniOrRuc ? (
                  <Button type="button" variant="outline" onClick={handleResolve} disabled={isResolving || !docNumber}>
                    {isResolving ? <Loader2 className="size-4 animate-spin" /> : "Verify"}
                  </Button>
                ) : null}
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="full_name">Full name / business name</Label>
            <Input
              id="full_name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={isDniOrRuc ? "e.g. Juan Pérez García" : "e.g. Acme S.A.C."}
              required
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="border-b border-border/70 pb-4">
          <CardTitle className="text-base">Contact details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 p-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email address</Label>
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
              countryCode={phoneCountryCode}
              onChange={setPhoneNumber}
              onCountryCodeChange={setPhoneCountryCode}
              required
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3 border-t border-border/70 pt-4">
        {onCancel ? (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSaving}>
            Cancel
          </Button>
        ) : null}
        <Button type="submit" disabled={isSaving} className="gap-2">
          {isSaving ? <Loader2 className="size-4 animate-spin" /> : submitIcon}
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
