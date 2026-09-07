import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowRight, CreditCard, Sparkles } from "lucide-react";

import { iamSessionCookies } from "@/contexts/iam/infrastructure/session/iam-session-cookie";
import { createEntryRouteQueryService } from "@/contexts/shared/application/internal/queryservices/entry-route-query.service";
import { appendWorkspaceSelection } from "@/contexts/shared/application/services/entry-route-navigation";
import { getServerDictionary } from "@/contexts/shared/infrastructure/i18n/server";
import { EntryRouteUnavailable } from "@/contexts/shared/interfaces/components/entry-route-unavailable";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/contexts/shared/interfaces/components/ui/card";
import { buttonVariants } from "@/contexts/shared/interfaces/components/ui/button";

interface WelcomePageProps {
  searchParams?: Promise<{ organizationId?: string; establishmentId?: string }>;
}

export default async function WelcomePage({ searchParams }: WelcomePageProps) {
  const query = searchParams ? await searchParams : {};
  const accessToken = (await cookies()).get(iamSessionCookies.accessToken)?.value;

  if (!accessToken) {
    redirect("/login");
  }

  const landing = await createEntryRouteQueryService()
    .resolveRoute({
      accessToken,
      organizationId: query.organizationId,
      establishmentId: query.establishmentId,
    })
    .catch(() => ({ status: "unavailable" as const }));

  if (landing.status === "ready") {
    redirect(appendWorkspaceSelection(landing.homeHref, query));
  }

  if (
    landing.status === "invitation-pending" ||
    landing.status === "organization-required" ||
    landing.status === "establishment-required"
  ) {
    redirect(landing.setupHref);
  }

  const dictionary = await getServerDictionary();
  if (landing.status === "unavailable") {
    return (
      <EntryRouteUnavailable
        title={dictionary.onboarding.serviceUnavailableTitle}
        description={dictionary.onboarding.unavailableDescription}
        retryLabel={dictionary.onboarding.retry}
      />
    );
  }

  return (
    <section className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6">
      <div className="w-full max-w-2xl space-y-7">
        <div className="space-y-4 text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-accent text-accent-foreground shadow-sm">
            <Sparkles className="size-5" aria-hidden="true" />
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            {dictionary.onboarding.welcomeEyebrow}
          </p>
          <h1 className="text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
            {dictionary.onboarding.welcomeTitle}
          </h1>
          <p className="mx-auto max-w-xl text-base leading-7 text-muted-foreground">
            {dictionary.onboarding.welcomeDescription}
          </p>
        </div>

        <Card className="overflow-hidden rounded-2xl border-border/70 shadow-sm">
          <CardHeader className="gap-3 border-b border-border/60 bg-muted/20 px-6 py-6 sm:px-8">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <CreditCard className="size-5" aria-hidden="true" />
            </div>
            <CardTitle className="text-xl">{dictionary.onboarding.subscriptionRequiredTitle}</CardTitle>
            <p className="text-sm leading-6 text-muted-foreground">
              {dictionary.onboarding.subscriptionRequiredDescription}
            </p>
          </CardHeader>
          <CardContent className="px-6 py-5 sm:px-8">
            <p className="text-sm text-muted-foreground">{dictionary.onboarding.planHint}</p>
          </CardContent>
          <CardFooter className="justify-end border-t border-border/60 bg-background px-6 py-5 sm:px-8">
            <Link href="/upgrade" className={buttonVariants({ className: "gap-2" })}>
              {dictionary.onboarding.choosePlan}
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </CardFooter>
        </Card>
      </div>
    </section>
  );
}
