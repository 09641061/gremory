"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { updateOrganizationAction } from "../../../actions/organization.actions";
import { initialBusinessActionResult } from "../../../actions/business-action-result";
import { Card, CardContent, CardHeader, CardTitle } from "@/contexts/shared/interfaces/components/ui/card";
import { ErrorAlert } from "@/contexts/shared/interfaces/components/ui/error";
import { EditOrganizationFormActions } from "./edit-organization-form-actions";
import {
  EditOrganizationFormHeader,
  EditOrganizationSectionTitle,
} from "./edit-organization-form-header";
import { EditOrganizationNameField } from "./edit-organization-name-field";
import { EditOrganizationImageSection } from "./edit-organization-image-section";

export function EditOrganizationForm({
  organization,
}: {
  organization: { id: string; name: string; imageUrl: string | null };
}) {
  const router = useRouter();
  const pathname = usePathname();
  const photoFileInputRef = useRef<HTMLInputElement | null>(null);
  const [name, setName] = useState(organization.name);
  const [currentImageUrl, setCurrentImageUrl] = useState(organization.imageUrl);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);
  const [photoMarkedForRemoval, setPhotoMarkedForRemoval] = useState(false);

  const [state, formAction, pending] = useActionState(
    updateOrganizationAction,
    initialBusinessActionResult,
  );

  useEffect(() => {
    router.refresh();
  }, [router]);

  useEffect(() => {
    if (state.status === "success") {
      router.push("/organizations");
      router.refresh();
    }
  }, [router, state.status]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setName(organization.name);
      setCurrentImageUrl(organization.imageUrl);
      setPhotoPreviewUrl(null);
      setPhotoMarkedForRemoval(false);
      if (photoFileInputRef.current) {
        photoFileInputRef.current.value = "";
      }
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [pathname, organization.id, organization.name, organization.imageUrl]);

  function handleRemovePhoto() {
    if (!organization.imageUrl) return;

    if (photoMarkedForRemoval) {
      setCurrentImageUrl(organization.imageUrl);
      setPhotoMarkedForRemoval(false);
      return;
    }

    setCurrentImageUrl(null);
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
    if (organization.imageUrl && currentImageUrl === null) {
      setCurrentImageUrl(organization.imageUrl);
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
        title="Unable to update organization"
        message={state.status === "error" && !pending ? state.error : undefined}
      />
      <div className="mx-auto w-full max-w-2xl space-y-6">
        <EditOrganizationFormHeader
          title="Edit organization"
          description="Update your organization details."
        />

        <Card>
          <CardHeader>
            <CardTitle>
              <EditOrganizationSectionTitle />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form action={formAction} className="space-y-5">
              <input type="hidden" name="id" value={organization.id} />
              <input type="hidden" name="currentPhotoUrl" value={organization.imageUrl ?? ""} />
              <input type="hidden" name="removePhoto" value={photoMarkedForRemoval ? "true" : "false"} />
              <EditOrganizationNameField value={name} onChange={setName} />
              <EditOrganizationImageSection
                organizationName={organization.name}
                currentImageUrl={currentImageUrl}
                photoPreviewUrl={photoPreviewUrl}
                photoMarkedForRemoval={photoMarkedForRemoval}
                photoFileInputRef={photoFileInputRef}
                onPhotoChange={handlePhotoChange}
                onRemovePhoto={handleRemovePhoto}
              />
              <EditOrganizationFormActions pending={pending} />
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
