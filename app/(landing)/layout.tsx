import { cookies } from "next/headers";
import { iamSessionCookies } from "@/contexts/iam/infrastructure/session/iam-session-cookie";
import { composeSharedAdapters } from "@/contexts/shared/interfaces/server/shared-composition";
import { LandingNavbar, LandingFooter } from "@/contexts/landing/interfaces/components";

export default async function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(iamSessionCookies.accessToken)?.value;

  let isAuthenticated = false;
  let workspaceHref = "/schedule";

  if (accessToken) {
    try {
      const landing = await composeSharedAdapters().entryRouteQueryService
        .resolveRoute({ accessToken })
        .catch(() => ({ status: "unavailable" as const }));

      if (landing.status === "ready") {
        isAuthenticated = true;
        workspaceHref = landing.homeHref;
      } else if (
        landing.status === "subscription-required" ||
        landing.status === "invitation-pending" ||
        landing.status === "organization-required" ||
        landing.status === "establishment-required"
      ) {
        isAuthenticated = true;
        workspaceHref = landing.setupHref;
      } else if (landing.status !== "unauthenticated") {
        isAuthenticated = true;
      }
    } catch {
      isAuthenticated = true;
    }
  }

  return (
    <div className="min-h-svh flex flex-col bg-background text-foreground selection:bg-primary/20 selection:text-foreground">
      <LandingNavbar
        isAuthenticated={isAuthenticated}
        workspaceHref={workspaceHref}
      />
      <main id="app-main-content" className="flex-1">
        {children}
      </main>
      <LandingFooter />
    </div>
  );
}
