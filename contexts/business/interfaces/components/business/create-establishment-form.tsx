"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Store } from "lucide-react";
import { createEstablishmentAction } from "../../actions/establishment.actions";
import {
  initialBusinessActionResult,
} from "../../actions/business-action-result";
import { Button, buttonVariants } from "@/contexts/shared/interfaces/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/contexts/shared/interfaces/components/ui/card";
import { ErrorAlert } from "@/contexts/shared/interfaces/components/ui/error";
import { Input } from "@/contexts/shared/interfaces/components/ui/input";
import { Label } from "@/contexts/shared/interfaces/components/ui/label";
import { Spinner } from "@/contexts/shared/interfaces/components/ui/spinner";

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
  }

  return (
    <>
      <ErrorAlert
        title="Unable to create establishment"
        message={state.status === "error" ? state.error : undefined}
      />
      <div className="mx-auto w-full max-w-2xl space-y-6">
        <div>
          <h1 className="page-title">New establishment</h1>
          <p className="page-description mt-2">
            Add a location for your organization.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="size-5 text-muted-foreground" />
              Establishment details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form action={formAction} className="space-y-5">
              <input type="hidden" name="organizationId" value={organizationId} />

              <div className="space-y-2">
                <Label htmlFor="establishment-name">Name</Label>
                <Input
                  id="establishment-name"
                  name="name"
                  required
                  maxLength={100}
                  placeholder="e.g. Downtown store"
                  autoComplete="organization"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="establishment-photo-file">
                  Photo file <span className="text-muted-foreground">(optional)</span>
                </Label>
                <Input
                  id="establishment-photo-file"
                  name="photoFile"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                />
                <p className="text-xs text-muted-foreground">
                  If you upload a file, it will be sent first and its public URL will be saved.
                </p>
              </div>

              <div className="space-y-3 rounded-2xl border border-border/70 bg-muted/20 p-4">
                <div className="space-y-1">
                  <Label className="text-sm font-medium">Image preview</Label>
                  <p className="text-xs text-muted-foreground">
                    This is how the selected image will look before you create the establishment.
                  </p>
                </div>

                {photoPreviewUrl ? (
                  <div className="overflow-hidden rounded-xl border border-border/60 bg-background">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photoPreviewUrl}
                      alt="Selected establishment image preview"
                      className="h-56 w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex h-56 items-center justify-center rounded-xl border border-dashed border-border/60 bg-background text-sm text-muted-foreground">
                    No image selected yet.
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 border-t border-border pt-5">
                <Link href="/establishments" className={buttonVariants({ variant: "ghost" })}>
                  Cancel
                </Link>
                <Button type="submit" disabled={pending} className="gap-2">
                  {pending && <Spinner data-icon="inline-start" />}
                  {pending ? "Creating..." : "Create establishment"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
