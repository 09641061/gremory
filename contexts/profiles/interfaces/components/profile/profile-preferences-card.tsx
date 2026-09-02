"use client";

import { useActionState, useEffect, useId, useState } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";

import { updatePreferencesAction, type UpdatePreferencesActionState } from "../../actions/update-preferences.action";
import type { ProfileViewModel } from "../../../application/services/profile.view-model";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/contexts/shared/interfaces/components/ui/card";
import { Button } from "@/contexts/shared/interfaces/components/ui/button";
import { ErrorAlert } from "@/contexts/shared/interfaces/components/error";
import { Spinner } from "@/contexts/shared/interfaces/components/ui/spinner";

const initialState: UpdatePreferencesActionState = { status: "idle", data: null, error: null };

export function ProfilePreferencesCard({ profile }: { profile: Pick<ProfileViewModel, "language" | "theme"> }) {
  const router = useRouter();
  const languageId = useId();
  const themeId = useId();
  const [language, setLanguage] = useState(profile.language);
  const [theme, setTheme] = useState(profile.theme);
  const [state, formAction, pending] = useActionState(updatePreferencesAction, initialState);
  const active = state.status === "success" && state.data ? state.data : profile;
  const unchanged = language === active.language && theme === active.theme;

  useEffect(() => {
    if (state.status === "success") router.refresh();
  }, [router, state.status]);

  return (
    <Card className="mx-auto w-full max-w-3xl overflow-hidden rounded-xl border-border bg-card shadow-sm">
      <CardHeader className="border-b border-border">
        <CardTitle>Preferences</CardTitle>
        <CardDescription>Choose your preferred language and theme.</CardDescription>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="grid gap-5 p-6 sm:grid-cols-2">
          {state.status === "error" ? <div className="sm:col-span-2"><ErrorAlert title="Unable to update preferences" message={state.error ?? undefined} /></div> : null}
          <div className="space-y-2">
            <label htmlFor={languageId} className="text-sm font-medium text-foreground">Language</label>
            <select id={languageId} name="language" value={language} onChange={(event) => setLanguage(event.target.value as "ES" | "EN")} disabled={pending} className="h-(--app-control-height) w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50">
              <option value="ES">ES</option>
              <option value="EN">EN</option>
            </select>
          </div>
          <div className="space-y-2">
            <label htmlFor={themeId} className="text-sm font-medium text-foreground">Theme</label>
            <select id={themeId} name="theme" value={theme} onChange={(event) => setTheme(event.target.value as "LIGHT" | "DARK")} disabled={pending} className="h-(--app-control-height) w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50">
              <option value="LIGHT">LIGHT</option>
              <option value="DARK">DARK</option>
            </select>
          </div>
        </CardContent>
        <CardFooter className="justify-end gap-2 border-border px-6 py-5">
          <Button type="button" variant="ghost" onClick={() => { setLanguage(active.language); setTheme(active.theme); }} disabled={pending || unchanged}>Cancel</Button>
          <Button type="submit" disabled={pending || unchanged} className="gap-2">
            {pending ? <Spinner className="size-4" /> : <Save className="size-4" />}
            {pending ? "Saving..." : "Save"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
