"use client";

import { useActionState, useEffect, useId, useState } from "react";
import Link from "next/link";
import { Building2, Plus } from "lucide-react";
import { createOrganizationAction } from "../../../actions/organization.actions";
import { initialBusinessActionResult } from "../../../actions/business-action-result";
import { Card, CardContent, CardFooter } from "@/contexts/shared/interfaces/components/ui/card";
import { Input } from "@/contexts/shared/interfaces/components/ui/input";
import { Button, buttonVariants } from "@/contexts/shared/interfaces/components/ui/button";
import { ErrorAlert } from "@/contexts/shared/interfaces/components/error";
import { Spinner } from "@/contexts/shared/interfaces/components/ui/spinner";
import { ImageUploadAvatar } from "@/contexts/shared/interfaces/components/image-upload-avatar";

/**
 * Onboarding step 1: the owner names their organization before anything else
 * exists. Also reused when a member starts their own business later, so the
 * copy stays generic rather than "welcome"-specific.
 *
 * `showCancel` must stay false during mandatory onboarding: with no
 * organization completed yet, there is nowhere valid to cancel back to - the
 * guard would just bounce the account right back here. It is true only for
 * the voluntary path, where the account already has a complete workspace to
 * return to (a member starting a second, separate business).
 */
export function CreateOrganizationForm({
  showCancel = false,
}: {
  showCancel?: boolean;
}) {
  const nameHeadingId = useId();

  const [name, setName] = useState("");

  const [state, formAction, pending] = useActionState(
    createOrganizationAction,
    initialBusinessActionResult,
  );

  const [formResetKey, setFormResetKey] = useState(0);

  useEffect(() => {
    if (state.status === "error") {
      setTimeout(() => {
        setFormResetKey((k) => k + 1);
      }, 0);
    }
  }, [state.status]);

  return (
    <>
      <ErrorAlert
        title="Unable to create organization"
        message={state.status === "error" && !pending ? state.error : undefined}
      />
      <div className="mx-auto w-full max-w-2xl space-y-6">
        <div>
          <h1 className="page-title">Create your organization</h1>
          <p className="page-description mt-2">
            This is the business that owns your establishments.
          </p>
        </div>

        <Card className="rounded-xl border-border bg-card shadow-sm overflow-hidden">
          <form key={formResetKey} action={formAction} className="flex flex-col">
            <CardContent className="p-0 flex flex-col">
              {/* Photo Section */}
              <div className="flex flex-col border-b border-border">
                <div className="flex items-center justify-between p-6">
                  <div className="space-y-1">
                    <h3 className="text-base font-semibold text-foreground">Organization Logo</h3>
                    <p className="text-sm text-muted-foreground">
                      This is your organization logo.<br />
                      Click on the logo to upload a custom one from your files.
                    </p>
                  </div>
                  <ImageUploadAvatar
                    name="photoFile"
                    alt={name}
                    fallbackIcon={<Building2 className="size-8 text-muted-foreground" />}
                  />
                </div>
              </div>

              {/* Name Section */}
              <div className="flex flex-col">
                <div className="space-y-4 p-6">
                  <div className="space-y-1">
                    {/* The section heading names the only field, so it labels it. */}
                    <h3 id={nameHeadingId} className="text-base font-semibold text-foreground">
                      Organization Name
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Please enter the official name for your organization.
                    </p>
                  </div>
                  <div className="max-w-xs">
                    <Input
                      name="name"
                      aria-labelledby={nameHeadingId}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Organization name"
                      maxLength={150}
                      required
                    />
                  </div>
                </div>
              </div>
            </CardContent>

            <CardFooter className="justify-end gap-2 rounded-b-xl border-t border-border bg-card px-6 py-5">
              {showCancel && (
                <Link href="/" className={buttonVariants({ variant: "ghost" })}>
                  Cancel
                </Link>
              )}
              <Button type="submit" disabled={pending} className="gap-2">
                {pending ? <Spinner className="size-4" /> : <Plus className="size-4" />}
                {pending ? "Creating..." : "Continue"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </>
  );
}
