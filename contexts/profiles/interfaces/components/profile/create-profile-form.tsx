"use client";

import { useActionState } from "react";
import { UserRound } from "lucide-react";

import {
  createProfileAction,
  type CreateProfileActionState,
} from "@/contexts/profiles/interfaces/actions/create-profile.action";
import {
  MAX_USERNAME_LENGTH,
  MIN_USERNAME_LENGTH,
} from "@/contexts/profiles/domain/model/valueobjects/username";
import { Alert, AlertDescription, AlertTitle } from "@/contexts/shared/interfaces/components/ui/alert";
import { Button } from "@/contexts/shared/interfaces/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/contexts/shared/interfaces/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/contexts/shared/interfaces/components/ui/field";
import { Input } from "@/contexts/shared/interfaces/components/ui/input";
import { Spinner } from "@/contexts/shared/interfaces/components/ui/spinner";
import { useProfilesI18n } from "@/contexts/profiles/interfaces/i18n";

const initialState: CreateProfileActionState = { status: "idle", error: null };

export function CreateProfileForm() {
  const { t, interpolate } = useProfilesI18n();
  const [state, formAction, pending] = useActionState(createProfileAction, initialState);
  const invalid = state.status === "error";

  return (
    <Card className="w-full max-w-xl">
      <CardHeader>
        <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <UserRound aria-hidden="true" />
        </div>
        <CardTitle className="text-xl">{t.onboarding.title}</CardTitle>
        <CardDescription>{t.onboarding.description}</CardDescription>
      </CardHeader>
      <form action={formAction}>
        <CardContent>
          <FieldGroup>
            {invalid ? (
              <Alert variant="destructive">
                <AlertTitle>{t.onboarding.errorTitle}</AlertTitle>
                <AlertDescription>{state.error}</AlertDescription>
              </Alert>
            ) : null}
            <Field data-invalid={invalid || undefined} data-disabled={pending || undefined}>
              <FieldLabel htmlFor="onboarding-username">{t.onboarding.usernameLabel}</FieldLabel>
              <Input
                id="onboarding-username"
                name="username"
                minLength={MIN_USERNAME_LENGTH}
                maxLength={MAX_USERNAME_LENGTH}
                pattern="^[a-zA-Z]+$"
                autoComplete="name"
                autoFocus
                required
                disabled={pending}
                aria-invalid={invalid}
              />
              <FieldDescription>
                {interpolate(t.onboarding.usernameHint, {
                  min: MIN_USERNAME_LENGTH,
                  max: MAX_USERNAME_LENGTH,
                })}
              </FieldDescription>
            </Field>
          </FieldGroup>
        </CardContent>
        <CardFooter className="justify-end">
          <Button type="submit" disabled={pending}>
            {pending ? <Spinner data-icon="inline-start" /> : null}
            {pending ? t.onboarding.saving : t.onboarding.continue}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
