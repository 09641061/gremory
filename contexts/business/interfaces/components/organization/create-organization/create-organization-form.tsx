"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { Building2, Plus } from "lucide-react";

import { createOrganizationAction } from "@/contexts/business/interfaces/actions/organization.actions";
import { initialBusinessActionResult } from "@/contexts/business/interfaces/actions/business-action-result";
import { Card, CardContent, CardFooter } from "@/contexts/shared/interfaces/components/ui/card";
import { Input } from "@/contexts/shared/interfaces/components/ui/input";
import { Button } from "@/contexts/shared/interfaces/components/ui/button";
import { ErrorAlert } from "@/contexts/shared/interfaces/components/ui/error";
import { Spinner } from "@/contexts/shared/interfaces/components/ui/spinner";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/contexts/shared/interfaces/components/ui/avatar";

export function CreateOrganizationForm() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState("");
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);
  const [state, formAction, pending] = useActionState(
    createOrganizationAction,
    initialBusinessActionResult,
  );
  const hasRedirected = useRef(false);

  useEffect(() => {
    if (state.status === "success" && !hasRedirected.current) {
      hasRedirected.current = true;
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

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoChange = (event: ChangeEvent<HTMLInputElement>) => {
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
    <section className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <div>
        <h1 className="page-title">Create your organization</h1>
        <p className="page-description mt-2">
          Start here to set up the first organization in your account and unlock the core product.
        </p>
      </div>

      <ErrorAlert
        title="Unable to create organization"
        message={state.status === "error" && !pending ? state.error : undefined}
      />

      <Card className="overflow-hidden rounded-xl border-border bg-card shadow-sm">
        <form action={formAction} className="flex flex-col">
          <input
            ref={fileInputRef}
            type="file"
            name="photoFile"
            accept="image/*"
            className="hidden"
            onChange={handlePhotoChange}
          />
          <CardContent className="p-0 flex flex-col">
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
                    <AvatarImage src={photoPreviewUrl} alt={name || "Organization"} />
                  ) : (
                    <AvatarFallback className="bg-muted">
                      <Building2 className="size-8 text-muted-foreground" />
                    </AvatarFallback>
                  )}
                </Avatar>
              </div>
            </div>

            <div className="flex flex-col">
              <div className="space-y-4 p-6">
                <div className="space-y-1">
                  <h3 className="text-base font-semibold text-foreground">Organization Name</h3>
                  <p className="text-sm text-muted-foreground">
                    Please enter the official name for your organization.
                  </p>
                </div>
                <div className="max-w-xs">
                  <Input
                    name="name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Organization name"
                    maxLength={150}
                    required
                  />
                </div>
              </div>
            </div>
          </CardContent>

          <CardFooter className="justify-end gap-2 rounded-b-xl border-t border-border bg-card px-6 py-5">
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.push("/subscribe")}
              disabled={pending}
            >
              Back
            </Button>
            <Button type="submit" disabled={pending} className="gap-2">
              {pending ? <Spinner className="size-4" /> : <Plus className="size-4" />}
              {pending ? "Creating..." : "Create organization"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </section>
  );
}
