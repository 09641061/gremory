"use client";

import { useState, useRef, useActionState } from "react";
import { Save, Store } from "lucide-react";
import type { EstablishmentListItem } from "./establishments-page";
import { updateEstablishmentAction } from "@/contexts/business/interfaces/actions/establishment.actions";
import { initialBusinessActionResult } from "@/contexts/business/interfaces/actions/business-action-result";
import { Card, CardContent, CardFooter } from "@/contexts/shared/interfaces/components/ui/card";
import { Input } from "@/contexts/shared/interfaces/components/ui/input";
import { Button } from "@/contexts/shared/interfaces/components/ui/button";
import { ErrorAlert } from "@/contexts/shared/interfaces/components/error";
import { Spinner } from "@/contexts/shared/interfaces/components/ui/spinner";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/contexts/shared/interfaces/components/ui/avatar";
import { TimeZoneField } from "../time-zone-field";
import { cn } from "@/lib/utils";

interface EstablishmentDetailCardProps {
  establishment: EstablishmentListItem | null;
  canUpdate?: boolean;
  onCancel?: () => void;
  className?: string;
}

export function EstablishmentDetailCard({
  establishment,
  canUpdate = true,
  onCancel,
  className,
}: EstablishmentDetailCardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(establishment?.name ?? "");
  const [previewUrl, setPreviewUrl] = useState<string | null>(establishment?.photoUrl ?? null);
  const [timeZone, setTimeZone] = useState(establishment?.timeZone ?? "America/Lima");

  const [state, formAction, pending] = useActionState(
    updateEstablishmentAction,
    initialBusinessActionResult,
  );

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
    }
  };

  const handleCancel = () => {
    setName(establishment?.name ?? "");
    setPreviewUrl(establishment?.photoUrl ?? null);
    setTimeZone(establishment?.timeZone ?? "America/Lima");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onCancel?.();
  };

  if (!establishment) {
    return (
      <div className={cn("flex-1", className)}>
        <div className="flex min-h-(--app-page-viewport-height) items-center justify-center rounded-xl border border-border bg-card p-8 text-center shadow-sm lg:ml-3">
          <div className="max-w-xs">
            <Store className="mx-auto size-10 text-muted-foreground/50" />
            <p className="mt-4 text-sm font-medium text-foreground">Select an establishment</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Choose an establishment to view its details.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("hidden flex-1 lg:block", className)}>
      <Card className="rounded-xl border-border bg-card shadow-sm lg:ml-3 lg:h-[calc(100vh-10rem)] flex flex-col overflow-hidden">
        <form action={formAction} className="flex flex-col min-h-0 flex-1">
          {/* Hidden inputs for form submit */}
          <input type="hidden" name="id" value={establishment.id} />
          <input type="hidden" name="currentPhotoUrl" value={establishment.photoUrl ?? ""} />
          <input
            ref={fileInputRef}
            type="file"
            name="photoFile"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />

          <CardContent className="p-0 flex flex-col min-h-0 flex-1 overflow-y-auto">
            {state.status === "error" && (
              <div className="p-6 pb-0">
                <ErrorAlert title="Unable to update establishment" message={state.error ?? undefined} />
              </div>
            )}

            {/* Establishment Photo Section */}
            <div className="flex flex-col border-b border-border">
              <div className="flex items-center justify-between p-6">
                <div className="space-y-1">
                  <h3 className="text-base font-semibold text-foreground">Establishment</h3>
                  <p className="text-sm text-muted-foreground">
                    {canUpdate ? (
                      <>
                        This is your establishment photo.<br />
                        Click on the photo to upload a custom one from your files.
                      </>
                    ) : (
                      "This is the establishment photo."
                    )}
                  </p>
                </div>
                <Avatar
                  className={`size-16 border border-border ${canUpdate ? "cursor-pointer transition-opacity hover:opacity-80" : ""}`}
                  onClick={canUpdate ? handleAvatarClick : undefined}
                >
                  {previewUrl ? (
                    <AvatarImage src={previewUrl} alt={name} />
                  ) : (
                    <AvatarFallback className="bg-muted">
                      <Store className="size-8 text-muted-foreground" />
                    </AvatarFallback>
                  )}
                </Avatar>
              </div>
            </div>

            {/* Establishment Name Section */}
            <div className="flex flex-col">
              <div className="space-y-4 p-6">
                <div className="space-y-1">
                  <h3 className="text-base font-semibold text-foreground">Establishment Name</h3>
                  {canUpdate && (
                    <p className="text-sm text-muted-foreground">
                      Please enter the official name for your establishment.
                    </p>
                  )}
                </div>
                <div className="max-w-xs">
                  <Input
                    name="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Establishment name"
                    maxLength={32}
                    disabled={!canUpdate}
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col border-t border-border">
              <div className="space-y-4 p-6">
                <div className="space-y-1">
                  <h3 className="text-base font-semibold text-foreground">Time zone</h3>
                  <p className="text-sm text-muted-foreground">
                    Used for scheduling and analytics in local time.
                  </p>
                </div>
                <div className="max-w-xs">
                  <TimeZoneField
                    name="timeZone"
                    value={timeZone}
                    onChange={setTimeZone}
                    disabled={!canUpdate}
                  />
                </div>
              </div>
            </div>
          </CardContent>

          {canUpdate && (
            <CardFooter className="shrink-0 justify-end gap-2 rounded-b-xl border-t border-border bg-card px-6 py-5">
              <Button
                type="button"
                variant="ghost"
                onClick={handleCancel}
                disabled={pending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={pending} className="gap-2">
                {pending ? <Spinner className="size-4" /> : <Save className="size-4" />}
                {pending ? "Saving..." : "Save"}
              </Button>
            </CardFooter>
          )}
        </form>
      </Card>
    </div>
  );
}
