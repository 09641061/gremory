"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Store } from "lucide-react";
import { updateEstablishmentAction } from "../../actions/establishment.actions";
import { initialBusinessActionResult } from "../../actions/business-action-result";
import { Button, buttonVariants } from "@/contexts/shared/interfaces/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/contexts/shared/interfaces/components/ui/card";
import { ErrorAlert } from "@/contexts/shared/interfaces/components/ui/error";
import { Input } from "@/contexts/shared/interfaces/components/ui/input";
import { Label } from "@/contexts/shared/interfaces/components/ui/label";
import { Spinner } from "@/contexts/shared/interfaces/components/ui/spinner";

export function EditEstablishmentForm({
  establishment,
}: {
  establishment: { id: string; name: string; photoUrl: string | null };
}) {
  const router = useRouter();
  const [name, setName] = useState(establishment.name);
  const [currentPhotoUrl, setCurrentPhotoUrl] = useState(establishment.photoUrl);
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
      router.push("/establishments");
      router.refresh();
    }
  }, [router, state.status]);

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

  return (
    <>
      <ErrorAlert
        title="Unable to update establishment"
        message={state.status === "error" ? state.error : undefined}
      />
      <div className="mx-auto w-full max-w-2xl space-y-6">
        <div>
          <h1 className="page-title">Edit establishment</h1>
          <p className="page-description mt-2">Update your establishment details.</p>
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
              <input type="hidden" name="id" value={establishment.id} />
              <input type="hidden" name="currentPhotoUrl" value={establishment.photoUrl ?? ""} />
              <input type="hidden" name="removePhoto" value={photoMarkedForRemoval ? "true" : "false"} />
              <div className="space-y-2">
                <Label htmlFor="establishment-name">Name</Label>
                <Input
                  id="establishment-name"
                  name="name"
                  required
                  maxLength={100}
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="establishment-photo-file">
                  Replace photo <span className="text-muted-foreground">(optional)</span>
                </Label>
                <Input
                  id="establishment-photo-file"
                  name="photoFile"
                  type="file"
                  accept="image/*"
                />
                <p className="text-xs text-muted-foreground">
                  Upload a new image to replace the current one automatically.
                </p>
              </div>

              <div className="space-y-3 rounded-2xl border border-border/70 bg-muted/20 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-1">
                    <Label className="text-sm font-medium">Current photo</Label>
                    <p className="text-xs text-muted-foreground">
                      You can remove the current image without deleting the establishment.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleRemovePhoto}
                    disabled={!establishment.photoUrl}
                    className="gap-2 border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
                  >
                    {photoMarkedForRemoval ? "Undo remove" : "Remove photo"}
                  </Button>
                </div>

                {currentPhotoUrl ? (
                  <div className="overflow-hidden rounded-xl border border-border/60 bg-background">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={currentPhotoUrl}
                      alt={establishment.name}
                      className="h-40 w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p>
                      No photo is currently set for this establishment.
                    </p>
                    {photoMarkedForRemoval ? (
                      <p>The current photo will be removed when you save changes.</p>
                    ) : null}
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-3 border-t border-border pt-5">
                <Link href="/establishments" className={buttonVariants({ variant: "ghost" })}>
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
