"use client";

import { useActionState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Building2 } from "lucide-react";
import { updateOrganizationAction } from "../../actions/organization.actions";
import { initialBusinessActionResult } from "../../actions/business-action-result";
import {
  Button,
  buttonVariants,
} from "@/contexts/shared/interfaces/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/contexts/shared/interfaces/components/ui/card";
import { ErrorAlert } from "@/contexts/shared/interfaces/components/ui/error";
import { Input } from "@/contexts/shared/interfaces/components/ui/input";
import { Label } from "@/contexts/shared/interfaces/components/ui/label";
import { Spinner } from "@/contexts/shared/interfaces/components/ui/spinner";

export function EditOrganizationForm({
  organization,
}: {
  organization: { id: string; name: string };
}) {
  const router = useRouter();
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
        <div>
          <h1 className="page-title">Edit organization</h1>
          <p className="page-description mt-2">
            Update your organization details.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="size-5 text-muted-foreground" />
              Organization details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form action={formAction} className="space-y-5">
              <input type="hidden" name="id" value={organization.id} />
              <div className="space-y-2">
                <Label htmlFor="organization-name">Name</Label>
                <Input
                  id="organization-name"
                  name="name"
                  required
                  maxLength={150}
                  autoComplete="organization"
                  defaultValue={organization.name}
                />
              </div>
              <div className="flex justify-end gap-3 border-t border-border pt-5">
                <Link
                  href="/organizations"
                  className={buttonVariants({ variant: "ghost" })}
                >
                  Cancel
                </Link>
                <Button type="submit" disabled={pending} className="gap-2">
                  {pending && <Spinner data-icon="inline-start" />}
                  {pending ? "Saving..." : "Save changes"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
