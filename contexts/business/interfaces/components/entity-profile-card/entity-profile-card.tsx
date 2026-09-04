"use client";

import { useState, useEffect, useRef, useId, useActionState } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { BusinessActionResult } from "@/contexts/business/interfaces/actions/business-action-result";
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
import { cn } from "@/lib/utils";
import { useBusinessTranslations } from "@/contexts/business/interfaces/i18n";

interface EntityProfileCardProps {
  /** Singular, capitalized noun of the edited entity, e.g. "Establishment". */
  entityLabel: string;
  /** What the image is called for this entity: "photo" for a place, "logo" for a brand. */
  photoNoun: string;
  icon: LucideIcon;
  entityId: string;
  entityName: string;
  photoUrl: string | null;
  updateAction: (
    previous: BusinessActionResult,
    formData: FormData,
  ) => Promise<BusinessActionResult>;
  canUpdate?: boolean;
  onCancel?: () => void;
  className?: string;
  /** Extra form fields rendered between the name field and the footer. */
  extraFields?: ReactNode;
}

/**
 * Name + image editor shared by the organization and the establishment: both
 * are a single entity edited in place, with the same image-preview, permission
 * and server-action mechanics. Only the nouns and the icon differ.
 */
export function EntityProfileCard({
  entityLabel,
  photoNoun,
  icon: Icon,
  entityId,
  entityName,
  photoUrl,
  updateAction,
  canUpdate = true,
  onCancel,
  className,
  extraFields,
}: EntityProfileCardProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const nameHeadingId = useId();
  const { t } = useBusinessTranslations();

  const [prevEntityId, setPrevEntityId] = useState(entityId);
  const [name, setName] = useState(entityName);
  const [previewUrl, setPreviewUrl] = useState<string | null>(photoUrl);

  if (entityId !== prevEntityId) {
    setPrevEntityId(entityId);
    setName(entityName);
    setPreviewUrl(photoUrl);
  }

  const [state, formAction, pending] = useActionState(
    updateAction,
    initialBusinessActionResult,
  );

  useEffect(() => {
    if (state.status === "success") {
      router.refresh();
    }
  }, [state.status, router]);

  const lowerLabel = entityLabel.toLowerCase();

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleCancel = () => {
    setName(entityName);
    setPreviewUrl(photoUrl);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onCancel?.();
  };

  const MAX_NAME_LENGTH = 20;
  const MIN_NAME_LENGTH = 3;
  const nameHintId = useId();
  const nameErrorId = useId();

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const sanitized = event.target.value.replace(/[^a-zA-Z]/g, "").slice(0, MAX_NAME_LENGTH);
    setName(sanitized);
  };

  const isTooShort = name.length > 0 && name.length < MIN_NAME_LENGTH;
  const isValid = name.length >= MIN_NAME_LENGTH && name.length <= MAX_NAME_LENGTH;

  return (
    <Card
      className={cn(
        "flex flex-col overflow-hidden rounded-xl border-border bg-card shadow-sm",
        className,
      )}
    >
      <form action={formAction} className="flex min-h-0 flex-1 flex-col">
        {/* Hidden inputs for form submit */}
        <input type="hidden" name="id" value={entityId} />
        <input type="hidden" name="currentPhotoUrl" value={photoUrl ?? ""} />
        <input
          ref={fileInputRef}
          type="file"
          name="photoFile"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />

        <CardContent className="flex min-h-0 flex-1 flex-col overflow-y-auto p-0">
          {state.status === "error" && (
            <div className="p-6 pb-0">
              <ErrorAlert
                title={t.entityCard.updateError.replace("{entity}", lowerLabel)}
                message={state.error ?? undefined}
              />
            </div>
          )}

          <div className="flex flex-col border-b border-border">
            <div className="flex items-center justify-between p-6">
              <div className="space-y-1">
                <h3 className="text-base font-semibold text-foreground">{entityLabel}</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-line">
                  {canUpdate
                    ? t.entityCard.canUpdateDescription
                        .replace("{entity}", lowerLabel)
                        .replace(/\{photoNoun\}/g, photoNoun)
                    : t.entityCard.readOnlyDescription
                        .replace("{entity}", lowerLabel)
                        .replace(/\{photoNoun\}/g, photoNoun)}
                </p>
              </div>
              {canUpdate ? (
                <button
                  type="button"
                  aria-label={t.entityCard.choosePhotoAria
                    .replace("{photoNoun}", photoNoun)
                    .replace("{name}", name)}
                  onClick={handleAvatarClick}
                  className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Avatar className="size-16 cursor-pointer border border-border transition-opacity hover:opacity-80">
                    <AvatarImage src={previewUrl ?? undefined} alt={name} />
                    <AvatarFallback className="bg-muted">
                      <Icon className="size-8 text-muted-foreground" />
                    </AvatarFallback>
                  </Avatar>
                </button>
              ) : (
                <Avatar className="size-16 border border-border">
                  <AvatarImage src={previewUrl ?? undefined} alt={name} />
                  <AvatarFallback className="bg-muted">
                    <Icon className="size-8 text-muted-foreground" />
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          </div>

          <div className="flex flex-col">
            <div className="space-y-4 p-6">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <h3 id={nameHeadingId} className="text-base font-semibold text-foreground">
                    {t.entityCard.nameHeading.replace("{entity}", entityLabel)}
                  </h3>
                  <span className="text-xs text-muted-foreground" aria-live="polite">
                    {name.length}/{MAX_NAME_LENGTH}
                  </span>
                </div>
                <p id={nameHintId} className="text-sm text-muted-foreground">
                  {t.entityCard.nameHint
                    .replace("{min}", String(MIN_NAME_LENGTH))
                    .replace("{max}", String(MAX_NAME_LENGTH))}
                </p>
              </div>
              <div className="max-w-xs">
                <Input
                  name="name"
                  aria-labelledby={nameHeadingId}
                  aria-describedby={`${nameHintId}${isTooShort ? ` ${nameErrorId}` : ""}`}
                  aria-invalid={isTooShort}
                  value={name}
                  onChange={handleNameChange}
                  placeholder={t.entityCard.namePlaceholder.replace("{entity}", entityLabel)}
                  maxLength={MAX_NAME_LENGTH}
                  minLength={MIN_NAME_LENGTH}
                  pattern="^[a-zA-Z]+$"
                  autoComplete="organization"
                  autoCapitalize="none"
                  spellCheck={false}
                  disabled={!canUpdate || pending}
                />
                {isTooShort ? (
                  <p id={nameErrorId} role="alert" className="mt-1 text-xs font-medium text-destructive">
                    {t.entityCard.nameMinError
                      .replace("{entity}", entityLabel)
                      .replace("{min}", String(MIN_NAME_LENGTH))}
                  </p>
                ) : null}
              </div>
            </div>
          </div>

          {extraFields}
        </CardContent>

        {canUpdate ? (
          <CardFooter className="shrink-0 justify-end gap-2 rounded-b-xl border-t border-border bg-card px-6 py-5">
            <Button type="button" variant="ghost" onClick={handleCancel} disabled={pending}>
              {t.entityCard.cancel}
            </Button>
            <Button type="submit" disabled={pending || !isValid} className="gap-2">
              {pending ? <Spinner className="size-4" /> : <Save className="size-4" />}
              {pending ? t.entityCard.saving : t.entityCard.save}
            </Button>
          </CardFooter>
        ) : (
          // Read-only on a small screen still needs a way back to the list, which
          // on a large screen stays visible beside the card.
          onCancel && (
            <CardFooter className="shrink-0 justify-end rounded-b-xl border-t border-border bg-card px-6 py-5 lg:hidden">
              <Button type="button" variant="ghost" onClick={handleCancel}>
                {t.entityCard.back}
              </Button>
            </CardFooter>
          )
        )}
      </form>
    </Card>
  );
}
