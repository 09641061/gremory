import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { iamSessionCookies } from "@/contexts/iam/infrastructure/session/iam-session-cookie";
import { createEntryRouteQueryService } from "@/contexts/shared/application/internal/queryservices/entry-route-query.service";
import { appendWorkspaceSelection } from "@/contexts/shared/application/services/entry-route-navigation";
import { getServerDictionary } from "@/contexts/shared/infrastructure/i18n/server";
import { EntryRouteUnavailable } from "@/contexts/shared/interfaces/components/entry-route-unavailable";

interface HomePageProps {
  searchParams: Promise<{ organizationId?: string; establishmentId?: string }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const query = await searchParams;
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
    landing.status === "subscription-required" ||
    landing.status === "invitation-pending" ||
    landing.status === "organization-required" ||
    landing.status === "establishment-required"
  ) {
    // Welcome is account-level activation, not a workspace context. Do not
    // carry a stale organization selection into the subscription gate.
    redirect(
      landing.status === "subscription-required"
        ? landing.setupHref
        : appendWorkspaceSelection(landing.setupHref, query),
    );
  }

  const dictionary = await getServerDictionary();
  return (
    <EntryRouteUnavailable
      title={dictionary.onboarding.unavailableTitle}
      description={dictionary.onboarding.unavailableDescription}
      retryLabel={dictionary.onboarding.retry}
    />
  );
}
