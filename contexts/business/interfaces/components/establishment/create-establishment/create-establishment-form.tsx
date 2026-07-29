"use client";

import { useActionState, useEffect, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { createEstablishmentAction } from "../../../actions/establishment.actions";
import { initialBusinessActionResult } from "../../../actions/business-action-result";
import { Card, CardContent, CardHeader, CardTitle } from "@/contexts/shared/interfaces/components/ui/card";
import { ErrorAlert } from "@/contexts/shared/interfaces/components/ui/error";
import { CreateEstablishmentFormActions } from "./create-establishment-form-actions";
import {
  CreateEstablishmentFormHeader,
  CreateEstablishmentSectionTitle,
} from "./create-establishment-form-header";
import { CreateEstablishmentNameField } from "./create-establishment-name-field";
import { CreateEstablishmentPhotoSection } from "./create-establishment-photo-section";

export function CreateEstablishmentForm({ organizationId }: { organizationId: string }) {
  const router = useRouter();
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);
  const [state, formAction, pending] = useActionState(
    createEstablishmentAction,
    initialBusinessActionResult,
  );

  useEffect(() => {
    if (state.status === "success") {
      router.push("/establishments");
      router.refresh();
    }
  }, [router, state.status]);

  useEffect(() => {
    return () => {
      if (photoPreviewUrl) {
        URL.revokeObjectURL(photoPreviewUrl);
      }
    };
  }, [photoPreviewUrl]);

  function handlePhotoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;

    if (photoPreviewUrl) {
      URL.revokeObjectURL(photoPreviewUrl);
    }

    if (!file) {
      setPhotoPreviewUrl(null);
      return;
    }

    setPhotoPreviewUrl(URL.createObjectURL(file));
  }

  return (
    <>
      <ErrorAlert
        title="Unable to create establishment"
        message={state.status === "error" && !pending ? state.error : undefined}
      />
      <div className="mx-auto w-full max-w-2xl space-y-6">
        <CreateEstablishmentFormHeader
          title="New establishment"
          description="Add a location for your organization."
        />

        <Card>
          <CardHeader>
            <CardTitle>
              <CreateEstablishmentSectionTitle />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form action={formAction} className="space-y-5">
              <input type="hidden" name="organizationId" value={organizationId} />
              <CreateEstablishmentNameField />
              <CreateEstablishmentPhotoSection
                photoPreviewUrl={photoPreviewUrl}
                onPhotoChange={handlePhotoChange}
              />
              <CreateEstablishmentFormActions pending={pending} />
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
