import type { ReactNode } from "react";
import { Suspense } from "react";
import { cookies } from "next/headers";
import { headers } from "next/headers";

import { ListConversationsQueryService } from "@/contexts/assistant/application/internal/queryservices/list-conversations-query.service";
import type { AssistantConversationSummaryReadModel } from "@/contexts/assistant/application/internal/transforms/assistant.read-models";
import { createCurrentSubscriptionQueryService } from "@/contexts/billing/application/internal/queryservices/current-subscription-query.service";
import { iamSessionCookies } from "@/contexts/iam/infrastructure/session/iam-session-cookie";
import { getMyProfileServerQuery } from "@/contexts/profiles/interfaces/queries/get-my-profile.query-handler";
import { createAppShellQueryService } from "@/contexts/shared/application/internal/queryservices/app-shell-query.service";
import { AppSidebar } from "@/contexts/shared/interfaces/components/app-sidebar";
import { AppSidebarFallback } from "@/contexts/shared/interfaces/components/app-sidebar-fallback";
import {
  SidebarProvider,
  SidebarTrigger,
} from "@/contexts/shared/interfaces/components/ui/sidebar";

/**
 * Shell for the work routes, the only ones the sidebar navigates between.
 *
 * Configuration screens and `/upgrade` are entered from here and leave through
 * their own back link, so they render outside this group: a sidebar there would
 * be a second, competing way out.
 *
 * The sidebar streams behind its own boundary so the workspace lookup never
 * delays the page underneath it.
 */
export default function AppLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <SidebarProvider className="bg-background text-foreground">
      <Suspense fallback={<AppSidebarFallback />}>
        <AppShellSidebar />
      </Suspense>

      <main className="flex min-w-0 flex-1 flex-col p-6">
        {/* The only way to reach the navigation on a phone, where the sidebar
            is a sheet instead of a column. */}
        <SidebarTrigger className="mb-4 md:hidden" />
        {children}
      </main>
    </SidebarProvider>
  );
}

async function AppShellSidebar() {
  const accessToken = (await cookies()).get(iamSessionCookies.accessToken)?.value;
  const requestHeaders = await headers();
  const establishmentId = requestHeaders.get("x-takodu-establishment-id") ?? undefined;
  const subscription = accessToken
    ? await createCurrentSubscriptionQueryService().getCurrentSubscriptionSnapshot(accessToken)
    : null;
  const shell = accessToken
    ? await createAppShellQueryService()
        .resolve({ subscription, workspace: { establishmentId } })
        .catch(() => null)
    : null;

  // An account that registered through an invitation belongs to no workspace
  // until it accepts, so there is nothing to navigate and no sidebar to render.
  if (!shell || shell.workspace.accountType === "PENDING_INVITATION") {
    return null;
  }

  const [currentProfile, assistantConversations] = await Promise.all([
    getMyProfileServerQuery(),
    shell.hasAssistantAccess
      ? new ListConversationsQueryService().handle({ page: 0, size: 20 })
      : Promise.resolve({ content: [] as AssistantConversationSummaryReadModel[] }),
  ]);

  return (
    <AppSidebar
      initialAssistantConversations={assistantConversations.content}
      currentProfile={currentProfile}
      workspace={shell.workspace}
      visibleRoutes={shell.visibleSidebarRoutes}
      showAssistantSection={shell.hasAssistantAccess}
      showAssistantNavigation={shell.hasAssistantAccess}
    />
  );
}
