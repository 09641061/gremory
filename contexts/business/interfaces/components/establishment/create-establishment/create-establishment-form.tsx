"use client";

import { useActionState, useEffect, useId, useState } from "react";
import Link from "next/link";
import { Store, Plus } from "lucide-react";
import { createEstablishmentAction } from "../../../actions/establishment.actions";
import { initialBusinessActionResult } from "../../../actions/business-action-result";
import { Card, CardContent, CardFooter } from "@/contexts/shared/interfaces/components/ui/card";
import { Input } from "@/contexts/shared/interfaces/components/ui/input";
import { Button, buttonVariants } from "@/contexts/shared/interfaces/components/ui/button";
import { ErrorAlert } from "@/contexts/shared/interfaces/components/error";
import { Spinner } from "@/contexts/shared/interfaces/components/ui/spinner";
import { ImageUploadAvatar } from "@/contexts/shared/interfaces/components/image-upload-avatar";
import { TimeZoneField } from "../time-zone-field";
import { useBusinessTranslations } from "@/contexts/business/interfaces/i18n";

/**
 * `showCancel` must stay false during mandatory onboarding (`ESTABLISHMENT_PENDING`):
 * with no establishment created yet, there is nowhere valid to cancel to -
 * `/establishments` is not reachable and the guard would just bounce the
 * account right back here. It is true once onboarding is already completed,
 * e.g. an owner adding another establishment to an org that already has one.
 */
import {
  MAX_ESTABLISHMENT_NAME_LENGTH,
  MIN_ESTABLISHMENT_NAME_LENGTH,
} from "@/contexts/business/domain/model/valueobjects/establishment-name.vo";

export function CreateEstablishmentForm({
  organizationId,
  showCancel = false,
}: {
  organizationId: string;
  showCancel?: boolean;
}) {
  const { t } = useBusinessTranslations();
  const nameHeadingId = useId();
  const nameHintId = useId();
  const nameErrorId = useId();

  const [name, setName] = useState("");
  const [timeZone, setTimeZone] = useState("America/Lima");

  const [state, formAction, pending] = useActionState(
    createEstablishmentAction,
    initialBusinessActionResult,
  );

  const [formResetKey, setFormResetKey] = useState(0);

  useEffect(() => {
    if (state.status === "error") {
      setTimeout(() => {
        setName("");
        setFormResetKey((k) => k + 1);
      }, 0);
    }
  }, [state.error, state.status]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitized = e.target.value.replace(/[^a-zA-Z]/g, "").slice(0, MAX_ESTABLISHMENT_NAME_LENGTH);
    setName(sanitized);
  };

  const isTooShort = name.length > 0 && name.length < MIN_ESTABLISHMENT_NAME_LENGTH;
  const isValid = name.length >= MIN_ESTABLISHMENT_NAME_LENGTH && name.length <= MAX_ESTABLISHMENT_NAME_LENGTH;

  return (
    <>
      <ErrorAlert
        title={t.establishments.createErrorTitle}
        message={state.status === "error" && !pending ? state.error : undefined}
      />
      <div className="mx-auto w-full max-w-2xl space-y-6">
        <div>
          <h1 className="page-title">{t.establishments.newTitle}</h1>
          <p className="page-description mt-2">
            {t.establishments.newDescription}
          </p>
        </div>

        <Card className="rounded-xl border-border bg-card shadow-sm overflow-hidden">
          <form key={formResetKey} action={formAction} className="flex flex-col">
            <input type="hidden" name="organizationId" value={organizationId} />

            <CardContent className="p-0 flex flex-col">
              {/* Photo Section */}
              <div className="flex flex-col border-b border-border">
                <div className="flex items-center justify-between p-6">
                  <div className="space-y-1">
                    <h3 className="text-base font-semibold text-foreground">{t.establishments.photoTitle}</h3>
                    <p className="text-sm text-muted-foreground">
                      {t.establishments.photoDescription}
                    </p>
                  </div>
                  <ImageUploadAvatar
                    name="photoFile"
                    alt={name}
                    fallbackIcon={<Store className="size-8 text-muted-foreground" />}
                  />
                </div>
              </div>

              {/* Name Section */}
              <div className="flex flex-col">
                <div className="space-y-4 p-6">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <h3 id={nameHeadingId} className="text-base font-semibold text-foreground">
                        {t.establishments.nameLabel}
                      </h3>
                      <span className="text-xs text-muted-foreground" aria-live="polite">
                        {name.length}/{MAX_ESTABLISHMENT_NAME_LENGTH}
                      </span>
                    </div>
                    <p id={nameHintId} className="text-sm text-muted-foreground">
                      {t.establishments.nameHint
                        .replace("{min}", String(MIN_ESTABLISHMENT_NAME_LENGTH))
                        .replace("{max}", String(MAX_ESTABLISHMENT_NAME_LENGTH))}
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
                      placeholder={t.establishments.namePlaceholder}
                      maxLength={MAX_ESTABLISHMENT_NAME_LENGTH}
                      minLength={MIN_ESTABLISHMENT_NAME_LENGTH}
                      pattern="^[a-zA-Z]+$"
                      autoComplete="organization"
                      autoCapitalize="none"
                      spellCheck={false}
                      disabled={pending}
                      required
                    />
                    {isTooShort ? (
                      <p id={nameErrorId} role="alert" className="mt-1 text-xs font-medium text-destructive">
                        {t.establishments.nameMinError.replace("{min}", String(MIN_ESTABLISHMENT_NAME_LENGTH))}
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="flex flex-col border-t border-border">
                <div className="space-y-4 p-6">
                  <div className="space-y-1">
                    <h3 className="text-base font-semibold text-foreground">{t.establishments.timeZoneTitle}</h3>
                    <p className="text-sm text-muted-foreground">
                      {t.establishments.timeZoneDescription}
                    </p>
                  </div>
                  <div className="max-w-xs">
                    <TimeZoneField
                      name="timeZone"
                      value={timeZone}
                      onChange={setTimeZone}
                    />
                  </div>
                </div>
              </div>
            </CardContent>

            <CardFooter className="justify-end gap-2 rounded-b-xl border-t border-border bg-card px-6 py-5">
              {showCancel && (
                <Link
                  href="/establishments"
                  className={buttonVariants({ variant: "ghost" })}
                >
                  {t.establishments.cancelButton}
                </Link>
              )}
              <Button type="submit" disabled={pending || !isValid} className="gap-2">
                {pending ? <Spinner className="size-4" /> : <Plus className="size-4" />}
                {pending ? t.establishments.creatingButton : t.establishments.createButton}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </>
  );
}
