"use client";

import type { RefObject } from "react";

import { Button } from "@/contexts/shared/interfaces/components/ui/button";
import { Input } from "@/contexts/shared/interfaces/components/ui/input";
import { Label } from "@/contexts/shared/interfaces/components/ui/label";

interface EditOrganizationImageSectionProps {
  organizationName: string;
  currentImageUrl: string | null;
  photoPreviewUrl: string | null;
  photoMarkedForRemoval: boolean;
  photoFileInputRef: RefObject<HTMLInputElement | null>;
  onPhotoChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onRemovePhoto: () => void;
}

export function EditOrganizationImageSection({
  organizationName,
  currentImageUrl,
  photoPreviewUrl,
  photoMarkedForRemoval,
  photoFileInputRef,
  onPhotoChange,
  onRemovePhoto,
}: EditOrganizationImageSectionProps) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="organization-photo-file">
          Replace image <span className="text-muted-foreground">(optional)</span>
        </Label>
        <Input
          id="organization-photo-file"
          name="photoFile"
          type="file"
          accept="image/*"
          ref={photoFileInputRef}
          onChange={onPhotoChange}
        />
        <p className="text-xs text-muted-foreground">
          Upload a new image to replace the current one automatically.
        </p>
      </div>

      <div className="space-y-3 rounded-2xl border border-border/70 bg-muted/20 p-4">
        {currentImageUrl ? (
          <>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <Label className="text-sm font-medium">Current image</Label>
                <p className="text-xs text-muted-foreground">
                  You can remove the current image without deleting the organization.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={onRemovePhoto}
                className="gap-2 border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
              >
                {photoMarkedForRemoval ? "Undo remove" : "Remove image"}
              </Button>
            </div>

            <div className="overflow-hidden rounded-xl border border-border/60 bg-background">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={currentImageUrl}
                alt={organizationName}
                className="h-40 w-full object-cover"
              />
            </div>
          </>
        ) : (
          <div className="space-y-3">
            <div className="space-y-1">
              <Label className="text-sm font-medium">Image preview</Label>
              <p className="text-xs text-muted-foreground">
                This will show the new image before you save the changes.
              </p>
            </div>

            {photoPreviewUrl ? (
              <div className="overflow-hidden rounded-xl border border-border/60 bg-background">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photoPreviewUrl}
                  alt="Selected organization image preview"
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
    </>
  );
}
