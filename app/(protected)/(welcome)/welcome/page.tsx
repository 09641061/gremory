import { Suspense } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { iamSessionCookies } from "@/contexts/iam/infrastructure/session/iam-session-cookie";
import { createEntryRouteQueryService } from "@/contexts/shared/application/internal/queryservices/entry-route-query.service";
import { appendWorkspaceSelection } from "@/contexts/shared/application/services/entry-route-navigation";
import { getServerDictionary } from "@/contexts/shared/infrastructure/i18n/server";
import { EntryRouteUnavailable } from "@/contexts/shared/interfaces/components/entry-route-unavailable";
import { PageLoading } from "@/contexts/shared/interfaces/components/page-loading";
import { buttonVariants } from "@/contexts/shared/interfaces/components/ui/button";

interface WelcomePageProps {
  searchParams?: Promise<{ organizationId?: string; establishmentId?: string }>;
}

/**
 * Keep the route shell instant-renderable while request-bound session data
 * is resolved in its own Suspense subtree (see `blocking-prerender-dynamic`).
 */
export default function WelcomePage({ searchParams }: WelcomePageProps) {
  return (
    <Suspense fallback={<PageLoading />}>
      <WelcomePageContent searchParams={searchParams} />
    </Suspense>
  );
}

async function WelcomePageContent({ searchParams }: WelcomePageProps) {
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

  if (landing.status === "unauthenticated") {
    redirect("/login");
  }

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
    <section
      aria-labelledby="welcome-title"
      className="flex flex-1 items-center justify-center px-6 py-20 sm:py-28"
    >
      <div className="w-full max-w-xl">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground/70">
          {dictionary.onboarding.welcomeEyebrow}
        </p>

        <h1
          id="welcome-title"
          className="mt-5 text-balance text-4xl font-semibold tracking-[-0.035em] text-foreground sm:text-5xl"
        >
          {dictionary.onboarding.welcomeTitle}
        </h1>

        <p className="mt-5 text-pretty text-base leading-7 text-muted-foreground">
          {dictionary.onboarding.welcomeDescription}
        </p>

        <hr className="mt-12 border-t border-border/60" />

        <div className="mt-7 flex flex-col-reverse items-stretch gap-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-xs text-sm leading-6 text-muted-foreground">
            {dictionary.onboarding.planHint}
          </p>
          <Link
            href="/upgrade"
            className={buttonVariants({ size: "lg", className: "shrink-0 gap-2" })}
          >
            {dictionary.onboarding.choosePlan}
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
