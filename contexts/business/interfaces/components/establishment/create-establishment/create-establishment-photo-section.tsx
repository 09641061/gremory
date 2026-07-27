"use client";

import type { ChangeEvent } from "react";

import { Input } from "@/contexts/shared/interfaces/components/ui/input";
import { Label } from "@/contexts/shared/interfaces/components/ui/label";

interface CreateEstablishmentPhotoSectionProps {
  photoPreviewUrl: string | null;
  onPhotoChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

export function CreateEstablishmentPhotoSection({
  photoPreviewUrl,
  onPhotoChange,
}: CreateEstablishmentPhotoSectionProps) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="establishment-photo-file">
          Photo file <span className="text-muted-foreground">(optional)</span>
        </Label>
        <Input
          id="establishment-photo-file"
          name="photoFile"
          type="file"
          accept="image/*"
          onChange={onPhotoChange}
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
    </>
  );
}
