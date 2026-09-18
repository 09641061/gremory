import { KeyRound } from "lucide-react";

import { getServerDictionary } from "@/contexts/shared/infrastructure/i18n/server";
import { AccessDeniedActions } from "@/contexts/shared/interfaces/components/access-denied-actions";
import { Card, CardContent } from "@/contexts/shared/interfaces/components/ui/card";

export default async function NoAccessPage() {
  const dictionary = await getServerDictionary();

  return (
    <section className="flex flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <Card className="rounded-2xl shadow-sm">
          <CardContent className="space-y-5 p-8 text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-accent text-accent-foreground">
              <KeyRound className="size-6" aria-hidden="true" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold tracking-tight">
                {dictionary.onboarding.noAccessTitle}
              </h1>
              <p className="text-sm leading-6 text-muted-foreground">
                {dictionary.onboarding.noAccessDescription}
              </p>
            </div>
            <AccessDeniedActions />
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
