"use client";

import { useActionState, useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Store, Plus } from "lucide-react";
import { createEstablishmentAction } from "../../../actions/establishment.actions";
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

export function CreateEstablishmentForm({ organizationId }: { organizationId: string }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);

  const [state, formAction, pending] = useActionState(
    createEstablishmentAction,
    initialBusinessActionResult,
  );

  const [formResetKey, setFormResetKey] = useState(0);
  const hasRedirected = useRef(false);

  useEffect(() => {
    if (state.status === "success" && !hasRedirected.current) {
      hasRedirected.current = true;
      const establishmentId = state.data?.id;
      const nextPath = establishmentId
        ? `/?organizationId=${encodeURIComponent(organizationId)}&establishmentId=${encodeURIComponent(establishmentId)}`
        : "/";
      router.push(nextPath);
      router.refresh();
    } else if (state.status === "error") {
      setTimeout(() => {
        setName("");
        setPhotoPreviewUrl((current) => {
          if (current) URL.revokeObjectURL(current);
          return null;
        });
        setFormResetKey((k) => k + 1);
      }, 0);
    }
  }, [organizationId, router, state.data?.id, state.error, state.status]);

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
        title="Unable to create establishment"
        message={state.status === "error" && !pending ? state.error : undefined}
      />
      <div className="mx-auto w-full max-w-2xl space-y-6">
        <div>
          <h1 className="page-title">New establishment</h1>
          <p className="page-description mt-2">
            Add a location for your organization.
          </p>
        </div>

        <Card className="rounded-xl border-border bg-card shadow-sm overflow-hidden">
          <form key={formResetKey} action={formAction} className="flex flex-col">
            <input type="hidden" name="organizationId" value={organizationId} />
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
                    <h3 className="text-base font-semibold text-foreground">Establishment Photo</h3>
                    <p className="text-sm text-muted-foreground">
                      This is your establishment photo.<br />
                      Click on the photo to upload a custom one from your files.
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
                        <Store className="size-8 text-muted-foreground" />
                      </AvatarFallback>
                    )}
                  </Avatar>
                </div>
              </div>

              {/* Name Section */}
              <div className="flex flex-col">
                <div className="space-y-4 p-6">
                  <div className="space-y-1">
                    <h3 className="text-base font-semibold text-foreground">Establishment Name</h3>
                    <p className="text-sm text-muted-foreground">
                      Please enter the official name for your establishment.
                    </p>
                  </div>
                  <div className="max-w-xs">
                    <Input
                      name="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Establishment name"
                      maxLength={32}
                      required
                    />
                  </div>
                </div>
              </div>
            </CardContent>

            <CardFooter className="justify-end gap-2 rounded-b-xl border-t border-border bg-card px-6 py-5">
              <Link
                href="/establishments"
                className={buttonVariants({ variant: "ghost" })}
              >
                Cancel
              </Link>
              <Button type="submit" disabled={pending} className="gap-2">
                {pending ? <Spinner className="size-4" /> : <Plus className="size-4" />}
                {pending ? "Creating..." : "Create"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </>
  );
}
