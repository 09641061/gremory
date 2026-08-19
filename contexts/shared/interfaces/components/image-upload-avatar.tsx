"use client";

import { useEffect, useRef, useState, type ChangeEvent, type ReactNode } from "react";

import { cn } from "@/lib/utils";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/contexts/shared/interfaces/components/ui/avatar";

interface ImageUploadAvatarProps {
  /** Name of the hidden file input, so it submits as part of the surrounding form. */
  name: string;
  /** Alt text for the preview image once a file is chosen. */
  alt: string;
  /** Icon shown while no file has been chosen. */
  fallbackIcon: ReactNode;
  className?: string;
}

/**
 * Click-to-upload avatar: a hidden file input plus a preview that swaps in
 * as soon as a file is chosen, reverting to `fallbackIcon` when cleared.
 * Owns the object URL lifecycle (create on choose, revoke on change/unmount)
 * so callers only need to supply the field name and the empty-state icon.
 */
export function ImageUploadAvatar({ name, alt, fallbackIcon, className }: ImageUploadAvatarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setPreviewUrl(file ? URL.createObjectURL(file) : null);
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        name={name}
        accept="image/*"
        className="hidden"
        onChange={handleChange}
      />
      <Avatar
        className={cn(
          "size-16 cursor-pointer border border-border transition-opacity hover:opacity-80",
          className,
        )}
        onClick={handleClick}
      >
        {previewUrl ? (
          <AvatarImage src={previewUrl} alt={alt} />
        ) : (
          <AvatarFallback className="bg-muted">{fallbackIcon}</AvatarFallback>
        )}
      </Avatar>
    </>
  );
}
