"use client";

import { useActionState, useEffect, useId, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Building2, Plus } from "lucide-react";
import { createOrganizationAction } from "../../../actions/organization.actions";
import { initialBusinessActionResult } from "../../../actions/business-action-result";
import { Card, CardContent, CardFooter } from "@/contexts/shared/interfaces/components/ui/card";
import { Input } from "@/contexts/shared/interfaces/components/ui/input";
import { Button, buttonVariants } from "@/contexts/shared/interfaces/components/ui/button";
import { ErrorAlert } from "@/contexts/shared/interfaces/components/error";
import { Spinner } from "@/contexts/shared/interfaces/components/ui/spinner";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/contexts/shared/interfaces/components/ui/avatar";

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
  nextHref = "/establishments/new",
  showCancel = false,
}: {
  nextHref?: string;
  showCancel?: boolean;
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const nameHeadingId = useId();

  const [name, setName] = useState("");
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);

  const [state, formAction, pending] = useActionState(
    createOrganizationAction,
    initialBusinessActionResult,
  );

  const [formResetKey, setFormResetKey] = useState(0);
  const hasRedirected = useRef(false);

  useEffect(() => {
    if (state.status === "success" && !hasRedirected.current) {
      hasRedirected.current = true;
      router.push(nextHref);
      router.refresh();
    } else if (state.status === "error") {
      setTimeout(() => {
        setPhotoPreviewUrl((current) => {
          if (current) URL.revokeObjectURL(current);
          return null;
        });
        setFormResetKey((k) => k + 1);
      }, 0);
    }
  }, [nextHref, router, state.status]);

  useEffect(() => {
    return () => {
      if (photoPreviewUrl) {
        URL.revokeObjectURL(photoPreviewUrl);
      }
    };
  }, [photoPreviewUrl]);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;

    if (photoPreviewUrl) {
      URL.revokeObjectURL(photoPreviewUrl);
    }

    if (!file) {
      setPhotoPreviewUrl(null);
      return;
    }

    setPhotoPreviewUrl(URL.createObjectURL(file));
  };

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
            <input
              ref={fileInputRef}
              type="file"
              name="photoFile"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoChange}
            />

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
                  <Avatar
                    className="size-16 cursor-pointer border border-border transition-opacity hover:opacity-80"
                    onClick={handleAvatarClick}
                  >
                    {photoPreviewUrl ? (
                      <AvatarImage src={photoPreviewUrl} alt={name} />
                    ) : (
                      <AvatarFallback className="bg-muted">
                        <Building2 className="size-8 text-muted-foreground" />
                      </AvatarFallback>
                    )}
                  </Avatar>
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
