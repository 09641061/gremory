"use client";

import { useActionState, useEffect, useId, useState } from "react";
import { useRouter } from "next/navigation";
import { Save, UserRound } from "lucide-react";

import {
  updateProfileAction,
  type UpdateProfileActionState,
} from "@/contexts/profiles/interfaces/actions/update-profile.action";
import { Card, CardContent, CardFooter } from "@/contexts/shared/interfaces/components/ui/card";
import { Input } from "@/contexts/shared/interfaces/components/ui/input";
import { Button } from "@/contexts/shared/interfaces/components/ui/button";
import { ErrorAlert } from "@/contexts/shared/interfaces/components/error";
import { Spinner } from "@/contexts/shared/interfaces/components/ui/spinner";
import { ImageUploadAvatar } from "@/contexts/shared/interfaces/components/image-upload-avatar";
import type { ProfileViewModel } from "@/contexts/profiles/application/services/profile.view-model";

const initialProfileActionState: UpdateProfileActionState = { status: "idle", data: null, error: null };

export function ProfileCard({ profile }: { profile: ProfileViewModel }) {
  const router = useRouter();
  const usernameLabelId = useId();
  const [username, setUsername] = useState(profile.username);
  const [state, formAction, pending] = useActionState(updateProfileAction, initialProfileActionState);

  useEffect(() => {
    if (state.status === "success") router.refresh();
  }, [router, state.status]);

  return (
    <Card className="mx-auto w-full max-w-3xl overflow-hidden rounded-xl border-border bg-card shadow-sm">
      <form action={formAction}>
        <input type="hidden" name="currentImageUrl" value={profile.imageUrl ?? ""} />
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
              initialUrl={profile.imageUrl}
              fallbackIcon={<UserRound className="size-8 text-muted-foreground" aria-hidden="true" />}
            />
          </div>

          <div className="space-y-4 p-6">
            <div className="space-y-1">
              <h2 id={usernameLabelId} className="text-base font-semibold text-foreground">Username</h2>
              <p className="text-sm text-muted-foreground">This is the name shown in your account.</p>
            </div>
            <Input
              name="username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              aria-labelledby={usernameLabelId}
              maxLength={32}
              disabled={pending}
            />
          </div>
        </CardContent>

        <CardFooter className="justify-end gap-2 border-t border-border px-6 py-5">
          <Button type="button" variant="ghost" onClick={() => setUsername(profile.username)} disabled={pending}>Cancel</Button>
          <Button type="submit" disabled={pending} className="gap-2">
            {pending ? <Spinner className="size-4" /> : <Save className="size-4" />}
            {pending ? "Saving..." : "Save"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
