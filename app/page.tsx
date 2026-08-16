import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { iamSessionCookies } from "@/contexts/iam/infrastructure/session/iam-session-cookie";
import { createEntryRouteQueryService } from "@/contexts/shared/application/internal/queryservices/entry-route-query.service";
import { createAppShellQueryService } from "@/contexts/shared/application/internal/queryservices/app-shell-query.service";

export default async function HomePage() {
  const accessToken = (await cookies()).get(iamSessionCookies.accessToken)?.value;
  if (!accessToken) {
    redirect("/access-denied");
  }

  const shell = await createAppShellQueryService().resolve().catch(() => null);
  if (shell) {
    redirect(shell.homeHref);
  }

  const landing = await createEntryRouteQueryService()
    .resolveRoute({ accessToken })
    .catch(() => null);

  if (landing?.status === "ready") {
    redirect(landing.homeHref);
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
