import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { iamSessionCookies } from "@/contexts/iam/infrastructure/session/iam-session-cookie";
import { createEntryRouteQueryService } from "@/contexts/shared/application/internal/queryservices/entry-route-query.service";
import { createAppShellQueryService } from "@/contexts/shared/application/internal/queryservices/app-shell-query.service";

interface HomePageProps {
  searchParams: Promise<{ organizationId?: string; establishmentId?: string }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const query = await searchParams;
  const accessToken = (await cookies()).get(iamSessionCookies.accessToken)?.value;
  if (!accessToken) {
    redirect("/access-denied");
  }

  const shell = await createAppShellQueryService()
    .resolve({ workspace: query })
    .catch(() => null);
  if (shell) {
    redirect(appendWorkspaceSelection(shell.homeHref, query));
  }

  const landing = await createEntryRouteQueryService()
    .resolveRoute({ accessToken, organizationId: query.organizationId, establishmentId: query.establishmentId })
    .catch(() => null);

  if (landing?.status === "ready") {
    redirect(appendWorkspaceSelection(landing.homeHref, query));
  }

  if (
    landing?.status === "invitation-pending" ||
    landing?.status === "organization-required" ||
    landing?.status === "establishment-required"
  ) {
    redirect(landing.setupHref);
  }

  redirect("/organizations/new");
}

function appendWorkspaceSelection(
  path: string,
  query: Readonly<{ organizationId?: string; establishmentId?: string }>,
) {
  const params = new URLSearchParams();
  if (query.organizationId) params.set("organizationId", query.organizationId);
  if (query.establishmentId) params.set("establishmentId", query.establishmentId);
  const queryString = params.toString();
  return queryString ? `${path}?${queryString}` : path;
}
