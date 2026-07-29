"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { updateEstablishmentAction } from "../../../actions/establishment.actions";
import { initialBusinessActionResult } from "../../../actions/business-action-result";
import { Card, CardContent, CardHeader, CardTitle } from "@/contexts/shared/interfaces/components/ui/card";
import { ErrorAlert } from "@/contexts/shared/interfaces/components/ui/error";
import { EditEstablishmentFormActions } from "./edit-establishment-form-actions";
import {
  EditEstablishmentFormHeader,
  EditEstablishmentSectionTitle,
} from "./edit-establishment-form-header";
import { EditEstablishmentNameField } from "./edit-establishment-name-field";
import { EditEstablishmentPhotoSection } from "./edit-establishment-photo-section";

export function EditEstablishmentForm({
  establishment,
}: {
  establishment: { id: string; name: string; photoUrl: string | null };
}) {
  const router = useRouter();
  const pathname = usePathname();
  const photoFileInputRef = useRef<HTMLInputElement | null>(null);
  const [name, setName] = useState(establishment.name);
  const [currentPhotoUrl, setCurrentPhotoUrl] = useState(establishment.photoUrl);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);
  const [photoMarkedForRemoval, setPhotoMarkedForRemoval] = useState(false);
  const [state, formAction, pending] = useActionState(
    updateEstablishmentAction,
    initialBusinessActionResult,
  );

  useEffect(() => {
    router.refresh();
  }, [router]);

  useEffect(() => {
    if (state.status === "success") {
      router.replace("/establishments");
      router.refresh();
    }
  }, [router, state.status]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setName(establishment.name);
      setCurrentPhotoUrl(establishment.photoUrl);
      setPhotoPreviewUrl(null);
      setPhotoMarkedForRemoval(false);
      if (photoFileInputRef.current) {
        photoFileInputRef.current.value = "";
      }
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [pathname, establishment.id, establishment.name, establishment.photoUrl]);

  useEffect(() => {
    function handlePageShow(event: PageTransitionEvent) {
      if (!event.persisted) return;

      setPhotoPreviewUrl(null);
      setPhotoMarkedForRemoval(false);
      if (photoFileInputRef.current) {
        photoFileInputRef.current.value = "";
      }
    }

    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
  }, []);

  function handleRemovePhoto() {
    if (!establishment.photoUrl) return;

    if (photoMarkedForRemoval) {
      setCurrentPhotoUrl(establishment.photoUrl);
      setPhotoMarkedForRemoval(false);
      return;
    }

    setCurrentPhotoUrl(null);
    setPhotoMarkedForRemoval(true);
  }

  function handlePhotoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;

    if (photoPreviewUrl) {
      URL.revokeObjectURL(photoPreviewUrl);
    }

    if (!file) {
      setPhotoPreviewUrl(null);
      return;
    }

    setPhotoPreviewUrl(URL.createObjectURL(file));
    setPhotoMarkedForRemoval(false);
    if (establishment.photoUrl && currentPhotoUrl === null) {
      setCurrentPhotoUrl(establishment.photoUrl);
    }
  }

  useEffect(() => {
    return () => {
      if (photoPreviewUrl) {
        URL.revokeObjectURL(photoPreviewUrl);
      }
    };
  }, [photoPreviewUrl]);

  return (
    <>
      <ErrorAlert
        title="Unable to update establishment"
        message={state.status === "error" && !pending ? state.error : undefined}
      />
      <div className="mx-auto w-full max-w-2xl space-y-6">
        <EditEstablishmentFormHeader
          title="Edit establishment"
          description="Update your establishment details."
        />

        <Card>
          <CardHeader>
            <CardTitle>
              <EditEstablishmentSectionTitle />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form action={formAction} className="space-y-5">
              <input type="hidden" name="id" value={establishment.id} />
              <input type="hidden" name="currentPhotoUrl" value={establishment.photoUrl ?? ""} />
              <input type="hidden" name="removePhoto" value={photoMarkedForRemoval ? "true" : "false"} />
              <EditEstablishmentNameField value={name} onChange={setName} />
              <EditEstablishmentPhotoSection
                establishmentName={establishment.name}
                currentPhotoUrl={currentPhotoUrl}
                photoPreviewUrl={photoPreviewUrl}
                photoMarkedForRemoval={photoMarkedForRemoval}
                photoFileInputRef={photoFileInputRef}
                onPhotoChange={handlePhotoChange}
                onRemovePhoto={handleRemovePhoto}
              />
              <EditEstablishmentFormActions pending={pending} />
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
