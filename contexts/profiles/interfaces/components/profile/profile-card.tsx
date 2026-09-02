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

const initialProfileActionState: UpdateProfileActionState = {
  status: "idle",
  data: null,
  error: null,
};

export function ProfileCard({ profile }: { profile: ProfileViewModel }) {
  const router = useRouter();
  const usernameLabelId = useId();
  const usernameHintId = useId();
  const usernameErrorId = useId();

  const [username, setUsername] = useState(profile.username);
  const [hasFileSelected, setHasFileSelected] = useState(false);
  const [state, formAction, pending] = useActionState(
    updateProfileAction,
    initialProfileActionState
  );

  const activeProfile = state.status === "success" && state.data ? state.data : profile;

  useEffect(() => {
    if (state.status === "success") {
      router.refresh();
      setHasFileSelected(false);
      if (state.data) {
        setUsername(state.data.username);
      }
    }
  }, [router, state.status, state.data]);

  useEffect(() => {
    setUsername(profile.username);
  }, [profile.username]);

  const handleUsernameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const sanitized = event.target.value.replace(/[^a-zA-Z]/g, "").slice(0, MAX_USERNAME_LENGTH);
    setUsername(sanitized);
  };

  const isTooShort = username.length > 0 && username.length < MIN_USERNAME_LENGTH;
  const isUnchanged = username === activeProfile.username && !hasFileSelected;
  const isValid = username.length >= MIN_USERNAME_LENGTH && username.length <= MAX_USERNAME_LENGTH;
  const canSave = isValid && !pending;

  return (
    <Card className="mx-auto w-full max-w-3xl overflow-hidden rounded-xl border-border bg-card shadow-sm">
      <form action={formAction}>
        <input type="hidden" name="currentImageUrl" value={activeProfile.imageUrl ?? ""} />
        <CardContent className="p-0">
          {state.status === "error" ? (
            <div className="p-6 pb-0">
              <ErrorAlert title="Unable to update profile" message={state.error ?? undefined} />
            </div>
          ) : null}

          <div className="flex items-center justify-between border-b border-border p-6">
            <div className="space-y-1">
              <h2 className="text-base font-semibold text-foreground">Profile photo</h2>
              <p className="text-sm text-muted-foreground">Click the photo to upload a new one.</p>
            </div>
            <ImageUploadAvatar
              name="imageFile"
              alt={username || "Profile photo"}
              initialUrl={activeProfile.imageUrl}
              onFileSelect={(file) => setHasFileSelected(Boolean(file))}
              fallbackIcon={<UserRound className="size-8 text-muted-foreground" aria-hidden="true" />}
            />
          </div>

          <div className="space-y-4 p-6">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <h2 id={usernameLabelId} className="text-base font-semibold text-foreground">
                  Username
                </h2>
                <span className="text-xs text-muted-foreground" aria-live="polite">
                  {username.length}/{MAX_USERNAME_LENGTH}
                </span>
              </div>
              <p id={usernameHintId} className="text-sm text-muted-foreground">
                Only letters (A-Z, a-z), {MIN_USERNAME_LENGTH} to {MAX_USERNAME_LENGTH} characters.
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
              placeholder="e.g. Mateo"
            />

            {isTooShort ? (
              <p id={usernameErrorId} role="alert" className="text-xs font-medium text-destructive">
                Username must be at least {MIN_USERNAME_LENGTH} characters.
              </p>
            ) : null}
          </div>
        </CardContent>

        <CardFooter className="justify-end gap-2 border-t border-border px-6 py-5">
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              setUsername(activeProfile.username);
              setHasFileSelected(false);
            }}
            disabled={pending || isUnchanged}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={!canSave} className="gap-2">
            {pending ? <Spinner className="size-4" /> : <Save className="size-4" />}
            {pending ? "Saving..." : "Save"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
