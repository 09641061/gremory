"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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

export function EditOrganizationForm({
  organization,
}: {
  organization: { id: string; name: string };
}) {
  const router = useRouter();
  const [name, setName] = useState(organization.name);
  const [state, formAction, pending] = useActionState(
    updateOrganizationAction,
    initialBusinessActionResult,
  );

  useEffect(() => {
    if (state.status === "success") {
      router.push("/organizations");
      router.refresh();
    }
  }, [router, state.status]);

  return (
    <>
      <ErrorAlert
        title="Unable to update organization"
        message={state.status === "error" ? state.error : undefined}
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
              <EditOrganizationNameField value={name} onChange={setName} />
              <EditOrganizationFormActions pending={pending} />
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
