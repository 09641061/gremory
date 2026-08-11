import type { ReactNode } from "react";

import { cookies } from "next/headers";
import { headers } from "next/headers";
import { ListConversationsQueryService } from "@/contexts/assistant/application/internal/queryservices/list-conversations-query.service";
import type { AssistantConversationSummaryReadModel } from "@/contexts/assistant/application/internal/transforms/assistant.read-models";
import { createCurrentSubscriptionQueryService } from "@/contexts/billing/application/internal/queryservices/current-subscription-query.service";
import { iamSessionCookies } from "@/contexts/iam/infrastructure/session/iam-session-cookie";
import { AppSidebar } from "@/contexts/shared/interfaces/components/app-sidebar";
import { SidebarProvider } from "@/contexts/shared/interfaces/components/ui/sidebar";
import { createAppShellQueryService } from "@/contexts/shared/application/internal/queryservices/app-shell-query.service";
import { getMyProfileServerQuery } from "@/contexts/profiles/interfaces/queries/get-my-profile.query-handler";

/**
 * Main app layout wrapper rendering the responsive Sidebar and main content canvas.
 */
export default async function AppLayout({
  children,
}: {
  children: ReactNode;
}) {
  const currentProfile = await getMyProfileServerQuery();
  const accessToken = (await cookies()).get(iamSessionCookies.accessToken)?.value;
  const requestHeaders = await headers();
  const subscription = accessToken
    ? await createCurrentSubscriptionQueryService().getCurrentSubscriptionSnapshot(accessToken)
    : null;
  const shell = accessToken
    ? await createAppShellQueryService().resolve({
        subscription,
        workspace: {
          organizationId: requestHeaders.get("x-takodu-organization-id") ?? undefined,
          establishmentId: requestHeaders.get("x-takodu-establishment-id") ?? undefined,
        },
      }).catch(() => null)
    : null;
  const hasAssistantAccess = shell?.hasAssistantAccess ?? false;

  const assistantConversations = hasAssistantAccess
    ? await new ListConversationsQueryService().handle({ page: 0, size: 20 })
    : { content: [] as AssistantConversationSummaryReadModel[] };

  return (
    <SidebarProvider>
      <AppSidebar
        initialAssistantConversations={assistantConversations.content}
        currentProfile={currentProfile}
        visibleRoutes={shell?.visibleSidebarRoutes ?? ["/analytics"]}
        showAssistantSection={hasAssistantAccess}
        showAssistantNavigation={hasAssistantAccess}
        planId={subscription?.planId}
      />
      <main className="flex-1 p-6 pt-16 lg:ml-[var(--app-sidebar-width)]">{children}</main>
    </SidebarProvider>
  );
}
