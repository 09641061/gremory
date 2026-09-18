"use client";

import { useActionState, useEffect, useId, useState } from "react";
import { useRouter } from "next/navigation";
import { Save, UserRound } from "lucide-react";

import {
  updateProfileAction,
  type UpdateProfileActionState,
} from "@/contexts/profiles/interfaces/actions/update-profile.action";
import {
  MIN_USERNAME_LENGTH,
  MAX_USERNAME_LENGTH,
} from "@/contexts/profiles/domain/model/valueobjects/username";
import { Card, CardContent, CardFooter } from "@/contexts/shared/interfaces/components/ui/card";
import { Input } from "@/contexts/shared/interfaces/components/ui/input";
import { Button } from "@/contexts/shared/interfaces/components/ui/button";
import { ErrorAlert } from "@/contexts/shared/interfaces/components/error";
import { Spinner } from "@/contexts/shared/interfaces/components/ui/spinner";
import { ImageUploadAvatar } from "@/contexts/shared/interfaces/components/image-upload-avatar";
import type { ProfileViewModel } from "@/contexts/profiles/application/services/profile.view-model";
import { useI18n } from "@/contexts/shared/interfaces/i18n";

const initialProfileActionState: UpdateProfileActionState = {
  status: "idle",
  data: null,
  error: null,
};

export function ProfileCard({ profile }: { profile: ProfileViewModel }) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    updateProfileAction,
    initialProfileActionState
  );
  const activeProfile = state.status === "success" && state.data ? state.data : profile;

  useEffect(() => {
    if (state.status === "success") {
      router.refresh();
    }
  }, [router, state.status]);

  return (
    <Card className="mx-auto w-full max-w-3xl overflow-hidden rounded-xl border-border bg-card shadow-sm">
      <ProfileCardForm
        key={`${activeProfile.username}:${activeProfile.imageUrl ?? ""}`}
        profile={activeProfile}
        state={state}
        formAction={formAction}
        pending={pending}
      />
    </Card>
  );
}

function ProfileCardForm({
  profile,
  state,
  formAction,
  pending,
}: {
  profile: ProfileViewModel;
  state: UpdateProfileActionState;
  formAction: (formData: FormData) => void;
  pending: boolean;
}) {
  const usernameLabelId = useId();
  const usernameHintId = useId();
  const usernameErrorId = useId();
  const { t, translate } = useI18n();
  const [username, setUsername] = useState(() => profile.username);
  const [hasFileSelected, setHasFileSelected] = useState(false);

  const handleUsernameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const sanitized = event.target.value.replace(/[^a-zA-Z]/g, "").slice(0, MAX_USERNAME_LENGTH);
    setUsername(sanitized);
  };

  const isTooShort = username.length > 0 && username.length < MIN_USERNAME_LENGTH;
  const isUnchanged = username === profile.username && !hasFileSelected;
  const isValid = username.length >= MIN_USERNAME_LENGTH && username.length <= MAX_USERNAME_LENGTH;
  const canSave = isValid && !pending;

  return (
    <form action={formAction}>
      <input type="hidden" name="currentImageUrl" value={profile.imageUrl ?? ""} />
      <CardContent className="p-0">
        {state.status === "error" ? (
          <div className="p-6 pb-0">
            <ErrorAlert title={t.profile.errorTitle} message={state.error ?? undefined} />
          </div>
        ) : null}

        <div className="flex items-center justify-between border-b border-border p-6">
          <div className="space-y-1">
            <h2 className="text-base font-semibold text-foreground">{t.profile.photoTitle}</h2>
            <p className="text-sm text-muted-foreground">{t.profile.photoDescription}</p>
          </div>
          <ImageUploadAvatar
            key={profile.imageUrl ?? "no-image"}
            name="imageFile"
            alt={username || t.profile.photoTitle}
            initialUrl={profile.imageUrl}
            onFileSelect={(file) => setHasFileSelected(Boolean(file))}
            fallbackIcon={<UserRound className="size-8 text-muted-foreground" aria-hidden="true" />}
          />
        </div>

        <div className="space-y-4 p-6">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <h2 id={usernameLabelId} className="text-base font-semibold text-foreground">
                {t.profile.usernameTitle}
              </h2>
              <span className="text-xs text-muted-foreground" aria-live="polite">
                {username.length}/{MAX_USERNAME_LENGTH}
              </span>
            </div>
            <p id={usernameHintId} className="text-sm text-muted-foreground">
              {translate("profile.usernameHint", { min: MIN_USERNAME_LENGTH, max: MAX_USERNAME_LENGTH })}
            </p>
          </div>

          <Input
            name="username"
            value={username}
            onChange={handleUsernameChange}
            aria-labelledby={usernameLabelId}
            aria-describedby={`${usernameHintId}${isTooShort ? ` ${usernameErrorId}` : ""}`}
            aria-invalid={isTooShort}
            maxLength={MAX_USERNAME_LENGTH}
            minLength={MIN_USERNAME_LENGTH}
            pattern="^[a-zA-Z]+$"
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            disabled={pending}
          />

          {isTooShort ? (
            <p id={usernameErrorId} role="alert" className="text-xs font-medium text-destructive">
              {translate("profile.usernameMinLength", { min: MIN_USERNAME_LENGTH })}
            </p>
          ) : null}
        </div>
      </CardContent>

      <CardFooter className="justify-end gap-2 border-t border-border px-6 py-5">
        <Button
          type="button"
          variant="ghost"
          onClick={() => {
            setUsername(profile.username);
            setHasFileSelected(false);
          }}
          disabled={pending || isUnchanged}
        >
          {t.profile.cancel}
        </Button>
        <Button type="submit" disabled={!canSave} className="gap-2">
          {pending ? <Spinner className="size-4" /> : <Save className="size-4" />}
          {pending ? t.profile.saving : t.profile.save}
        </Button>
      </CardFooter>
    </form>
  );
}
