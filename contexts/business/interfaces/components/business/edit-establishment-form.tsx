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
  const [isRemovingPhoto, setIsRemovingPhoto] = useState(false);
  const [photoActionError, setPhotoActionError] = useState<string | null>(null);
  const [state, formAction, pending] = useActionState(
    updateEstablishmentAction,
    initialBusinessActionResult,
  );

  useEffect(() => {
    if (state.status === "success") {
      router.push("/establishments");
      router.refresh();
    }
  }, [router, state.status]);

  async function handleRemovePhoto() {
    if (!currentPhotoUrl || isRemovingPhoto) return;

    setIsRemovingPhoto(true);
    setPhotoActionError(null);

    try {
      const response = await fetch(
        `/api/business/establishments/${encodeURIComponent(establishment.id)}/photo`,
        {
          method: "DELETE",
          cache: "no-store",
          credentials: "include",
        },
      );

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as
          | { message?: string }
          | null;
        throw new Error(data?.message || "Unable to remove the establishment photo");
      }

      setCurrentPhotoUrl(null);
      router.refresh();
    } catch (error) {
      setPhotoActionError(
        error instanceof Error ? error.message : "Unable to remove the establishment photo",
      );
    } finally {
      setIsRemovingPhoto(false);
    }
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
                    onClick={() => {
                      void handleRemovePhoto();
                    }}
                    disabled={!currentPhotoUrl || isRemovingPhoto}
                    className="gap-2 border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
                  >
                    {isRemovingPhoto ? "Removing..." : "Remove photo"}
                  </Button>
                </div>

                {photoActionError ? (
                  <p className="text-sm text-destructive">{photoActionError}</p>
                ) : null}

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
                  <p className="text-sm text-muted-foreground">
                    No photo is currently set for this establishment.
                  </p>
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
