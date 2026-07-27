"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
      router.push("/establishments");
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
                  ref={photoFileInputRef}
                  onChange={handlePhotoChange}
                />
                <p className="text-xs text-muted-foreground">
                  Upload a new image to replace the current one automatically.
                </p>
              </div>

              <div className="space-y-3 rounded-2xl border border-border/70 bg-muted/20 p-4">
                {currentPhotoUrl ? (
                  <>
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
                        className="gap-2 border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
                      >
                        {photoMarkedForRemoval ? "Undo remove" : "Remove photo"}
                      </Button>
                    </div>

                    <div className="overflow-hidden rounded-xl border border-border/60 bg-background">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={currentPhotoUrl}
                        alt={establishment.name}
                        className="h-40 w-full object-cover"
                      />
                    </div>
                  </>
                ) : (
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <Label className="text-sm font-medium">Image preview</Label>
                      <p className="text-xs text-muted-foreground">
                        This will show the new photo before you save the changes.
                      </p>
                    </div>

                    {photoPreviewUrl ? (
                      <div className="overflow-hidden rounded-xl border border-border/60 bg-background">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={photoPreviewUrl}
                          alt="Selected establishment image preview"
                          className="h-40 w-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-border/60 bg-background text-sm text-muted-foreground">
                        No image selected yet.
                      </div>
                    )}
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
